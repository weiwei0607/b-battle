import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDi3E5jHjanuw-4huooIiJ5SqhWmdm2EP0",
  authDomain: "b-battle-580b5.firebaseapp.com",
  projectId: "b-battle-580b5",
  storageBucket: "b-battle-580b5.firebasestorage.app",
  messagingSenderId: "912827003016",
  appId: "1:912827003016:web:febd90b0c5fc0484dcaf3d",
  measurementId: "G-N45T9PP5V5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { signInWithPopup, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
