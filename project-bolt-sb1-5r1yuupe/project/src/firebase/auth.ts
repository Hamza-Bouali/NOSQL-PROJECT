import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { auth, db } from './config';
import { User, UserRole } from '../types';

const PATIENTS_COLLECTION = 'patients';
const USERS_COLLECTION = 'users';

// Register a new user with role
export const registerUser = async (email: string, password: string, role: UserRole, name: string): Promise<void> => {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    const userRef = doc(db, USERS_COLLECTION, userCredential.user.uid);
    await setDoc(userRef, {
      email,
      role,
      name,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login a user
export const loginUser = async (email: string, password: string): Promise<void> => {
  try {
    console.log('Authenticating user with email:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userCredential.user.uid));
    
    if (!userDoc.exists()) {
      console.error('User document not found for UID:', userCredential.user.uid);
      throw new Error('User document not found');
    }

    console.log('User authenticated successfully:', userDoc.data());
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout the current user
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Get current user with role
export const getCurrentUser = async (): Promise<User | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
  if (!userDoc.exists()) return null;

  return {
    id: user.uid,
    ...userDoc.data()
  } as User;
};

// Check if user has admin role
export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === 'admin';
};

// Check if user has access to patient data
export const canAccessPatientData = async (patientId: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // Admins can access all patient data
  if (user.role === 'admin') return true;
  
  // Patients can only access their own data
  return user.id === patientId;
};

// Listen for authentication state changes
export const onAuthStateChange = (callback: (user: User | null) => void): void => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
    if (!userDoc.exists()) {
      callback(null);
      return;
    }

    callback({
      id: firebaseUser.uid,
      ...userDoc.data()
    } as User);
  });
};

// Authenticate a user with username and password
export const authenticateUser = async (username: string, password: string): Promise<boolean> => {
  try {
    const patientsRef = collection(db, PATIENTS_COLLECTION);
    const q = query(patientsRef, where('email', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error(`User with email ${username} not found.`);
      throw new Error('User not found');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    console.log('User found:', userData);

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      console.error('Invalid password for user:', username);
      throw new Error('Invalid password');
    }

    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Authenticate a user with admin credentials from Firestore
export const authenticateAdmin = async (username: string, password: string): Promise<boolean> => {
  try {
    const patientsRef = collection(db, PATIENTS_COLLECTION);
    const q = query(patientsRef, where('email', '==', username), where('role', '==', 'admin'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error(`Admin with email ${username} not found.`);
      throw new Error('Admin not found');
    }

    const adminDoc = querySnapshot.docs[0];
    const adminData = adminDoc.data();
    console.log('Admin found:', adminData);

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, adminData.password);
    if (!isPasswordValid) {
      console.error('Invalid password for admin:', username);
      throw new Error('Invalid password');
    }

    return true;
  } catch (error) {
    console.error('Admin authentication error:', error);
    throw error;
  }
};
