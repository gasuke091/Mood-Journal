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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface MoodData {
  id: string;
  label: string;
  emoji: string;
  color: string;
  valence: number; // -2 (distressed) to +2 (peaceful/joyful)
}

export const AVAILABLE_MOODS: MoodData[] = [
  { id: 'peaceful', label: 'Peaceful', emoji: '😌', color: 'emerald', valence: 2 },
  { id: 'joyful', label: 'Joyful', emoji: '😊', color: 'amber', valence: 2 },
  { id: 'grateful', label: 'Grateful', emoji: '🙏', color: 'teal', valence: 1 },
  { id: 'inspired', label: 'Inspired', emoji: '💡', color: 'violet', valence: 1 },
  { id: 'reflective', label: 'Reflective', emoji: '😐', color: 'stone', valence: 0 },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: 'orange', valence: -1 },
  { id: 'down', label: 'Down', emoji: '😔', color: 'sky', valence: -1 },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😫', color: 'rose', valence: -2 },
];

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
  mood?: MoodData | null;
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
  const path = `users/${userId}/interactions/${interactionId}`;
  const docRef = doc(db, 'users', userId, 'interactions', interactionId);

  const cleanData = sanitizePayload({
    ...data,
    userId,
    createdAt: data.createdAt || Date.now(),
  });

  try {
    await setDoc(docRef, cleanData);
    return interactionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
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

  const path = `users/${userId}/interactions`;
  const interactionsRef = collection(db, 'users', userId, 'interactions');
  const q = query(interactionsRef, orderBy('createdAt', 'desc'), limit(maxItems));

  try {
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
        mood: docData.mood || null,
      });
    });

    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
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

  const path = `users/${userId}/interactions/${interactionId}`;
  const docRef = doc(db, 'users', userId, 'interactions', interactionId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { onAuthStateChanged };
export type { User };
