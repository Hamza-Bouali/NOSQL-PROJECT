import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {

  apiKey: "AIzaSyC5uTMoC417hwyNHcGavG9Oj9tKz1eDBag",

  authDomain: "nosql-project-ae298.firebaseapp.com",

  projectId: "nosql-project-ae298",

  storageBucket: "nosql-project-ae298.firebasestorage.app",

  messagingSenderId: "55937142787",

  appId: "1:55937142787:web:6de03de41cae21e439fe36",

  measurementId: "G-HYBEMSFT3G"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;