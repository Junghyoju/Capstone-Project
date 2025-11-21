// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMqP99KDqREcaqAUW8Unlq1zdxemTUXrQ",
  authDomain: "capstone-project-f673f.firebaseapp.com",
  projectId: "capstone-project-f673f",
  storageBucket: "capstone-project-f673f.firebasestorage.app",
  messagingSenderId: "635291899178",
  appId: "1:635291899178:web:47db9e13aad462b0eefa53",
  measurementId: "G-ETH9RYK64V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
