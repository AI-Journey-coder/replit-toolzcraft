import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { logger } from "./logger";

let app: App | null = null;

function getFirebaseApp(): App {
  if (app) return app;
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0]!;
    return app;
  }
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (serviceAccountJson) {
    app = initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
  } else if (projectId) {
    logger.warn(
      "FIREBASE_SERVICE_ACCOUNT_JSON not set; verifying tokens using project id only",
    );
    app = initializeApp({ projectId });
  } else {
    throw new Error(
      "Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or VITE_FIREBASE_PROJECT_ID.",
    );
  }
  return app;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  return getAuth(getFirebaseApp()).verifyIdToken(token);
}
