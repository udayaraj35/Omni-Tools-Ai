'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseSdks {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function getSdks(firebaseApp: FirebaseApp): FirebaseSdks {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)')
  };
}

/**
 * Initializes Firebase using production services.
 * This is designed to work with Firebase App Hosting environment variables
 * or fall back to the provided config object.
 */
export function initializeFirebase(): FirebaseSdks {
  if (!getApps().length) {
    let firebaseApp: FirebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables (preferred)
      firebaseApp = initializeApp();
    } catch (e) {
      // Fallback to static config during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }

  // If already initialized, return the existing SDKs
  return getSdks(getApp());
}
