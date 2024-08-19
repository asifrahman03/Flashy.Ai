// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBx5FUZBEQXtw1k8--jfKe-nq6i8Ui_STA",
  authDomain: "flashcards-b7b23.firebaseapp.com",
  projectId: "flashcards-b7b23",
  storageBucket: "flashcards-b7b23.appspot.com",
  messagingSenderId: "721088952285",
  appId: "1:721088952285:web:9c42099596961367466834",
  measurementId: "G-J19H6KDB8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

export {db}