export interface MedicalRecord {
  id?: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  prescription: string;
  temperature: number;
  pulse: number;
  blood_pressure: string;
}

export interface Appointment {
  id?: string;
  date: string;
  doctor: string;
  department: string;
  status: 'Programmé' | 'Confirmé' | 'Terminé' | 'Annulé';
  room: string;
}

export interface Patient {
  id?: string;
  name: string;
  birthdate: string;
  gender: string;
  blood_type: string;
  chronic_conditions: string;
  email: string;
  phone: string;
  address: string;
  records: MedicalRecord[];
  appointments: Appointment[];
}