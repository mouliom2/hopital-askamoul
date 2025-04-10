export interface Patient {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: string;
  contact_number: string;
  address: string;
  medical_history?: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  datetime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
}
