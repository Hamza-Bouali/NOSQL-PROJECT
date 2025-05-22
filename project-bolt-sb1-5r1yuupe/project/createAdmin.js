import bcrypt from 'bcryptjs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

const createAdmin = async () => {
  const email = 'admin@example.com';
  const password = 'admin123';
  const role = 'admin';

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add admin to the database
    const adminData = {
      email,
      password: hashedPassword,
      role,
      name: 'Admin User',
    };

    const docRef = await addDoc(collection(db, 'patients'), adminData);
    console.log('Admin created with ID:', docRef.id);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

createAdmin();
