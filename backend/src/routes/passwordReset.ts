import { Router } from 'express';
import { z } from 'zod';
import { createPasswordResetRequest, verifyPasswordResetOtp } from '../services/passwordResetService';

const router = Router();

const requestSchema = z.object({
  email: z.string().email(),
});

router.post('/request', async (req, res, next) => {
  try {
    const { email } = requestSchema.parse(req.body);
    await createPasswordResetRequest(email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

router.post('/verify', async (req, res, next) => {
  try {
    const { email, otp } = verifySchema.parse(req.body);
    const result = await verifyPasswordResetOtp(email, otp);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const passwordResetRouter = router;
