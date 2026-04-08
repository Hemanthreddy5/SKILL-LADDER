import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDcYo9Yc_T-UkY55v7_AsQ9Ss7-UthMmTo",
  authDomain: "skillladder-9bf10.firebaseapp.com",
  projectId: "skillladder-9bf10",
  storageBucket: "skillladder-9bf10.firebasestorage.app",
  messagingSenderId: "933335668452",
  appId: "1:933335668452:web:21d745d683ab4e3a507ef1",
  measurementId: "G-J019HSLXC6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
