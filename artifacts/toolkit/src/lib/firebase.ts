import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
  type ConfirmationResult,
} from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

export const firebaseConfigured = Boolean(apiKey && projectId && appId);

let app: FirebaseApp | null = null;

function getApp(): FirebaseApp {
  if (!firebaseConfigured) {
    throw new Error("Firebase is not configured");
  }
  if (app) return app;
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0]!;
    return app;
  }
  app = initializeApp({
    apiKey: apiKey!,
    authDomain: `${projectId}.firebaseapp.com`,
    projectId: projectId!,
    appId: appId!,
  });
  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getApp());
}

export function watchAuth(cb: (user: FirebaseUser | null) => void): () => void {
  if (!firebaseConfigured) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(getFirebaseAuth(), cb);
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
  return result.user;
}

let recaptcha: RecaptchaVerifier | null = null;

export function ensureRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptcha) return recaptcha;
  recaptcha = new RecaptchaVerifier(getFirebaseAuth(), containerId, {
    size: "invisible",
  });
  return recaptcha;
}

export function resetRecaptcha(): void {
  if (recaptcha) {
    recaptcha.clear();
    recaptcha = null;
  }
}

export async function startPhoneSignIn(
  phoneNumber: string,
  containerId: string,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(getFirebaseAuth(), phoneNumber, ensureRecaptcha(containerId));
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export type { FirebaseUser, ConfirmationResult };
