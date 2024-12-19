// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { getAuth, signInWithCustomToken } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_DOMAIN_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJ_ID_KEY,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET_KEY,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_ID_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_KEY,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_KEY
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {db, auth, signInWithCustomToken}