import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQWpuIDI70RlO9nPTgqoYHvL0pVuDKbEQ",
  authDomain: "dar-harp-store.firebaseapp.com",
  projectId: "dar-harp-store",
  storageBucket: "dar-harp-store.firebasestorage.app",
  messagingSenderId: "431422167226",
  appId: "1:431422167226:web:7f0168da97ada397048a83"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);