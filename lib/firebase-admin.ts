import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Attempt to read project config from firebase-applet-config.json
let firebaseConfig: {
  projectId?: string;
  firestoreDatabaseId?: string;
} = {};

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (err) {
  console.warn('[firebase-admin] Warning: could not parse firebase-applet-config.json', err);
}

export const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  firebaseConfig.projectId ||
  'gen-lang-client-0211563645';

export const databaseId =
  firebaseConfig.firestoreDatabaseId ||
  'ai-studio-secureagentarchi-bcf9fc9b-76d4-4bd4-bcc6-cc4dcea057c7';

let adminAppInstance: App;

if (getApps().length === 0) {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (clientEmail && privateKey) {
    adminAppInstance = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  } else {
    // Cloud Run and Google Cloud automatically authenticate via Application Default Credentials (ADC)
    adminAppInstance = initializeApp({
      projectId,
    });
  }
} else {
  adminAppInstance = getApp();
}

export const adminApp: App = adminAppInstance;
export const adminAuth: Auth = getAuth(adminApp);

// Target the specified provisioned Firestore database
export const adminDb: Firestore =
  databaseId && databaseId !== '(default)'
    ? getFirestore(adminApp, databaseId)
    : getFirestore(adminApp);

export { FieldValue };

