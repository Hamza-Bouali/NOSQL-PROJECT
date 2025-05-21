import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  DocumentReference, 
  onSnapshot,
  writeBatch 
} from 'firebase/firestore';
import { db } from './config';
import { Patient, MedicalRecord, Appointment } from '../types';

const PATIENTS_COLLECTION = 'patients';

// Get collection reference
const patientsRef = collection(db, PATIENTS_COLLECTION);

// Get all patients
export const getAllPatients = (callback: (patients: Patient[]) => void) => {
  const q = query(patientsRef, orderBy('name', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const patients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Patient[];
    callback(patients);
  });
};

// Search patients
export const searchPatients = (
  term: string, 
  field: 'name' | 'gender' | 'chronic_conditions' = 'name',
  callback: (patients: Patient[]) => void
) => {
  // This is a simple implementation, in a real app you might want to use 
  // a more sophisticated search with multiple fields or Firestore's array-contains
  const q = query(patientsRef, where(field, '>=', term), where(field, '<=', term + '\uf8ff'));
  
  return onSnapshot(q, (snapshot) => {
    const patients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Patient[];
    callback(patients);
  });
};

// Get patients with upcoming appointments
export const getPatientsWithUpcomingAppointments = (callback: (patients: Patient[]) => void) => {
  // Get all patients and filter client-side
  // A more sophisticated implementation would use a cloud function to create a separate collection
  return getAllPatients((patients) => {
    const today = new Date().toISOString().split('T')[0];
    const filteredPatients = patients.filter(patient => {
      return patient.appointments.some(appointment => 
        appointment.date >= today && 
        (appointment.status === 'Programmé' || appointment.status === 'Confirmé')
      );
    });
    callback(filteredPatients);
  });
};

// Get a single patient by ID
export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        id: docSnap.id, 
        ...docSnap.data() 
      } as Patient;
    }
    return null;
  } catch (error) {
    console.error("Error fetching patient:", error);
    throw error;
  }
};

// Add a new patient
export const addPatient = async (patient: Omit<Patient, 'id'>): Promise<string> => {
  try {
    // Initialize empty arrays if not provided
    const patientData = {
      ...patient,
      records: patient.records || [],
      appointments: patient.appointments || [],
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(patientsRef, patientData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
};

// Update a patient
export const updatePatient = async (id: string, data: Partial<Patient>): Promise<void> => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
};

// Delete a patient
export const deletePatient = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
};

// Add a medical record to a patient
export const addMedicalRecord = async (
  patientId: string, 
  record: MedicalRecord
): Promise<void> => {
  try {
    const patientRef = doc(db, PATIENTS_COLLECTION, patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error("Patient not found");
    }
    
    const patient = patientSnap.data() as Patient;
    const records = patient.records || [];
    
    // Add an ID to the record
    const recordWithId = {
      ...record,
      id: crypto.randomUUID()
    };
    
    // Add the new record
    await updateDoc(patientRef, {
      records: [...records, recordWithId],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding medical record:", error);
    throw error;
  }
};

// Update a medical record
export const updateMedicalRecord = async (
  patientId: string,
  recordId: string,
  recordData: Partial<MedicalRecord>
): Promise<void> => {
  try {
    const patientRef = doc(db, PATIENTS_COLLECTION, patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error("Patient not found");
    }
    
    const patient = patientSnap.data() as Patient;
    const records = patient.records || [];
    
    // Find and update the specific record
    const updatedRecords = records.map(record => {
      if (record.id === recordId) {
        return { ...record, ...recordData };
      }
      return record;
    });
    
    await updateDoc(patientRef, {
      records: updatedRecords,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating medical record:", error);
    throw error;
  }
};

// Delete a medical record
export const deleteMedicalRecord = async (
  patientId: string,
  recordId: string
): Promise<void> => {
  try {
    const patientRef = doc(db, PATIENTS_COLLECTION, patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error("Patient not found");
    }
    
    const patient = patientSnap.data() as Patient;
    const updatedRecords = (patient.records || []).filter(
      record => record.id !== recordId
    );
    
    await updateDoc(patientRef, {
      records: updatedRecords,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error deleting medical record:", error);
    throw error;
  }
};

// Add an appointment to a patient
export const addAppointment = async (
  patientId: string,
  appointment: Appointment
): Promise<void> => {
  try {
    const patientRef = doc(db, PATIENTS_COLLECTION, patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error("Patient not found");
    }
    
    const patient = patientSnap.data() as Patient;
    const appointments = patient.appointments || [];
    
    // Add an ID to the appointment
    const appointmentWithId = {
      ...appointment,
      id: crypto.randomUUID()
    };
    
    await updateDoc(patientRef, {
      appointments: [...appointments, appointmentWithId],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding appointment:", error);
    throw error;
  }
};

// Update an appointment
export const updateAppointment = async (
  patientId: string,
  appointmentId: string,
  appointmentData: Partial<Appointment>
): Promise<void> => {
  try {
    const patientRef = doc(db, PATIENTS_COLLECTION, patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error("Patient not found");
    }
    
    const patient = patientSnap.data() as Patient;
    const appointments = patient.appointments || [];
    
    // Find and update the specific appointment
    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === appointmentId) {
        return { ...appointment, ...appointmentData };
      }
      return appointment;
    });
    
    await updateDoc(patientRef, {
      appointments: updatedAppointments,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

// Delete an appointment
export const deleteAppointment = async (
  patientId: string,
  appointmentId: string
): Promise<void> => {
  try {
    const patientRef = doc(db, PATIENTS_COLLECTION, patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error("Patient not found");
    }
    
    const patient = patientSnap.data() as Patient;
    const updatedAppointments = (patient.appointments || []).filter(
      appointment => appointment.id !== appointmentId
    );
    
    await updateDoc(patientRef, {
      appointments: updatedAppointments,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
};