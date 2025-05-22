import bcrypt from 'bcryptjs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration
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
const db = getFirestore(app);
const auth = getAuth(app);

const createUser = async () => {
  const email = 'user@example.com';
  const password = 'user123';
  const name = 'Admin User';
  const role = 'patient';

  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    const userData = {
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    // Add to users collection
    await setDoc(doc(db, 'users', user.uid), userData);

    // Add to patients collection
    const patientData = {
      ...userData,
      records: [],
      appointments: [],
    };
    await setDoc(doc(db, 'patients', user.uid), patientData);

    console.log('Patient user created successfully with ID:', user.uid);
  } catch (error) {
    console.error('Error creating user:', error);
  }
};

createUser();
