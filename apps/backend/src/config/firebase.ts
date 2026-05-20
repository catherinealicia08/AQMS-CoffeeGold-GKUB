import 'dotenv/config';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [
      !projectId ? 'FIREBASE_PROJECT_ID' : null,
      !clientEmail ? 'FIREBASE_CLIENT_EMAIL' : null,
      !privateKey ? 'FIREBASE_PRIVATE_KEY' : null,
    ].filter(Boolean);

    throw new Error(
      `Missing Firebase Admin env var(s): ${missing.join(', ')}. ` +
        'Set them in `apps/backend/.env` (service account project_id, client_email, private_key).'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;