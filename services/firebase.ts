// FIX: Removed the /// <reference types="vite/client" /> directive.
// This was causing an error because the Vite type definitions were not found in the project's configuration.
// By removing it, we can address the subsequent type errors on `import.meta.env` directly.

import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration is now read from environment variables.
// Ensure you set these variables in your deployment environment (e.g., Vercel, Netlify).
// Example: VITE_FIREBASE_API_KEY=your_key_here
const firebaseConfig = {
    // FIX: Cast `import.meta` to `any` to resolve TypeScript errors.
    // This is necessary because without the Vite client types, TypeScript does not recognize the `env` property on `import.meta`.
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
    authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
    measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings to improve connection stability.
initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);