
import "server-only";
import admin from "firebase-admin";

let auth: admin.auth.Auth;
let db: admin.firestore.Firestore;

/**
 * Firebase Admin SDK initialization using environment variables.
 */
if (!process.env.FIREBASE_ADMIN_KEY) {
    console.warn('WARNING: FIREBASE_ADMIN_KEY is not set. Admin features (Email & Confirmation) will be disabled.');
} else {
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(
            JSON.parse(process.env.FIREBASE_ADMIN_KEY)
          )
        });
      } catch (error: any) {
        console.error('Firebase admin initialization error', error.stack);
      }
    }
    // @ts-ignore
    auth = admin.auth();
    // @ts-ignore
    db = admin.firestore();
}

export { auth, db };
