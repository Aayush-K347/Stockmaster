import admin from 'firebase-admin';
import { env } from './env';

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.firebase.projectId,
    clientEmail: env.firebase.clientEmail,
    privateKey: env.firebase.privateKey.replace(/\\n/g, '\n'),
  }),
});

export const firebaseAuth = app.auth();
export const firestore = app.firestore();
