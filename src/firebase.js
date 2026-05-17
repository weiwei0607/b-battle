import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ Set these vars in .env and rotate the Firebase API key — it was previously committed in plain text.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDi3E5jHjanuw-4huooIiJ5SqhWmdm2EP0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "b-battle-580b5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "b-battle-580b5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "b-battle-580b5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "912827003016",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:912827003016:web:febd90b0c5fc0484dcaf3d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-N45T9PP5V5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { signInWithPopup, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
