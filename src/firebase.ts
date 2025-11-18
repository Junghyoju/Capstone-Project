import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUEOTguZosm_jhGw4SL1kgsQzHBSJphR8",
  authDomain: "smart-factory-dashboard.firebaseapp.com",
  projectId: "smart-factory-dashboard",
  storageBucket: "smart-factory-dashboard.firebasestorage.app",
  messagingSenderId: "602875650571",
  appId: "1:602875650571:web:95f9bf3cd98bd666a6dd0e",
  measurementId: "G-8M318R9WFJ",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
