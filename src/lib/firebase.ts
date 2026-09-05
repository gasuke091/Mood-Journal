import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore targeting the specific provisioned database
const databaseId = (firebaseConfigJson as any).firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);

/**
 * Directive 6: Database Persistence, Clean Payloads, & Transaction Integrity
 * Strict Undefined-Stripping (Zero-Crash Payload Hygiene)
 */
export function sanitizePayload<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

export interface InteractionRecord {
  id?: string;
  userId: string;
  userEmail?: string | null;
  prompt: string;
  geminiResponse: string;
  mode: 'reflect' | 'summarize' | 'brainstorm' | 'chat';
  modelUsed: string;
  durationMs?: number;
  createdAt: number; // Unix timestamp
  title?: string;
}

/**
 * Sign in using Google Federated Identity (Passwordless)
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Auth sign-in failed:', error);
    throw error;
  }
}

/**
 * Sign out current authenticated user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Firebase Auth sign-out failed:', error);
    throw error;
  }
}

/**
 * Saves a user interaction to /users/{userId}/interactions/{interactionId}
 * Strict owner-bound path enforcing Firestore security rules
 */
export async function saveUserInteraction(
  userId: string,
  data: Omit<InteractionRecord, 'id' | 'userId'>
): Promise<string> {
  if (!userId) {
    throw new Error('User ID is required to persist interaction.');
  }

  const interactionId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const docRef = doc(db, 'users', userId, 'interactions', interactionId);

  const cleanData = sanitizePayload({
    ...data,
    userId,
    createdAt: data.createdAt || Date.now(),
  });

  await setDoc(docRef, cleanData);
  return interactionId;
}

/**
 * Fetches interactions isolated to the authenticated user
 */
export async function fetchUserInteractions(
  userId: string,
  maxItems: number = 50
): Promise<InteractionRecord[]> {
  if (!userId) {
    throw new Error('User ID is required to fetch interactions.');
  }

  const interactionsRef = collection(db, 'users', userId, 'interactions');
  const q = query(interactionsRef, orderBy('createdAt', 'desc'), limit(maxItems));

  const querySnapshot = await getDocs(q);
  const records: InteractionRecord[] = [];

  querySnapshot.forEach((docSnapshot) => {
    const docData = docSnapshot.data();
    records.push({
      id: docSnapshot.id,
      userId: docData.userId,
      userEmail: docData.userEmail,
      prompt: docData.prompt || '',
      geminiResponse: docData.geminiResponse || '',
      mode: docData.mode || 'reflect',
      modelUsed: docData.modelUsed || 'gemini-3.6-flash',
      durationMs: docData.durationMs,
      createdAt: docData.createdAt || 0,
      title: docData.title || '',
    });
  });

  return records;
}

/**
 * Deletes an interaction isolated to the authenticated user
 */
export async function deleteUserInteraction(
  userId: string,
  interactionId: string
): Promise<void> {
  if (!userId || !interactionId) {
    throw new Error('User ID and Interaction ID are required for deletion.');
  }

  const docRef = doc(db, 'users', userId, 'interactions', interactionId);
  await deleteDoc(docRef);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { onAuthStateChanged };
export type { User };
