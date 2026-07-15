// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCxnKT0yzDbcR53tEGMGqeT8bqFgn5-w4g",
    authDomain: "eventflow-de7ec.firebaseapp.com",
    projectId: "eventflow-de7ec",
    storageBucket: "eventflow-de7ec.firebasestorage.app",
    messagingSenderId: "655753377303",
    appId: "1:655753377303:web:8fb70d08483e2d6f02ce52",
    measurementId: "G-L8F68KE2HT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services the rest of the app needs
export const db = getFirestore(app);
export const auth = getAuth(app);