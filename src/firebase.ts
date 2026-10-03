import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace these placeholders with your actual keys from the Firebase Console!
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSy_placeholder_key",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder-app.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "placeholder-app",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder-app.appspot.com",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
