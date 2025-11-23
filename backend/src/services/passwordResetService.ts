import admin from 'firebase-admin';
import { firebaseAuth, firestore } from '../config/firebase';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const PASSWORD_RESET_COLLECTION = 'passwordResetRequests';
const MAIL_COLLECTION = 'mail';
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const createPasswordResetRequest = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOtp();
  const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + OTP_EXPIRY_MS);

  try {
    await firebaseAuth.getUserByEmail(normalizedEmail);
  } catch (error: any) {
    if (error?.code === 'auth/user-not-found') {
      logger.info({ email: normalizedEmail }, 'Password reset requested for non-existent user');
      return;
    }

    logger.error({ error }, 'Failed to look up user for password reset');
    throw new HttpError(500, 'Unable to start password reset request');
  }

  let oobCode: string | null = null;
  try {
    const resetLink = await firebaseAuth.generatePasswordResetLink(normalizedEmail, {
      url: env.passwordResetRedirectUrl,
      handleCodeInApp: true,
    });

    const resetUrl = new URL(resetLink);
    oobCode = resetUrl.searchParams.get('oobCode');
  } catch (error) {
    logger.error({ error }, 'Failed to generate password reset link');
    throw new HttpError(500, 'Unable to generate reset code');
  }

  if (!oobCode) {
    logger.error({ email: normalizedEmail }, 'Failed to extract oobCode from reset link');
    throw new HttpError(500, 'Unable to generate reset code');
  }

  const requestRef = firestore.collection(PASSWORD_RESET_COLLECTION).doc();
  await requestRef.set({
    email: normalizedEmail,
    otp,
    oobCode,
    expiresAt,
    used: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await firestore.collection(MAIL_COLLECTION).add({
    to: [normalizedEmail],
    message: {
      subject: 'Your Stockmaster password reset code',
      text: `Use this code to reset your password: ${otp}. It expires in 10 minutes.`,
      html: `<p>Use this code to reset your password:</p><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`,
    },
  });
};

export const verifyPasswordResetOtp = async (email: string, otp: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();

  const snapshot = await firestore
    .collection(PASSWORD_RESET_COLLECTION)
    .where('email', '==', normalizedEmail)
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();

  if (snapshot.empty) {
    throw new HttpError(400, 'No reset request found for this email');
  }

  const match = snapshot.docs.find((doc) => {
    const data = doc.data();
    return data.otp === otp && !data.used;
  });

  if (!match) {
    throw new HttpError(400, 'Invalid or already used OTP');
  }

  const data = match.data();
  const expiresAt = (data.expiresAt as admin.firestore.Timestamp | undefined)?.toMillis();

  if (!expiresAt || expiresAt < now) {
    throw new HttpError(400, 'The OTP has expired. Please request a new one.');
  }

  await match.ref.update({ used: true, usedAt: admin.firestore.FieldValue.serverTimestamp() });

  return { oobCode: data.oobCode as string, email: normalizedEmail };
};
