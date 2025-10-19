// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBypcSX1NfcswCSsnAqKmtU4TnycShdvwM",
    authDomain: "uiu-cgpa-calculator-151a3.firebaseapp.com",
    projectId: "uiu-cgpa-calculator-151a3",
    storageBucket: "uiu-cgpa-calculator-151a3.firebasestorage.app",
    messagingSenderId: "47128659045",
    appId: "1:47128659045:web:6525730413b0580fe6728c"
  };

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
