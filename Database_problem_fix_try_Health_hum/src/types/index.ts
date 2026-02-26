// User roles
export type UserRole = 
  | 'admin' 
  | 'doctor' 
  | 'receptionist' 
  | 'nurse' 
  | 'pharmacy' 
  | 'laboratory' 
  | 'billing' 
  | 'patient'
  | 'bloodbank';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  specialization?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

// Patient interface
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  medicalHistory: MedicalRecord[];
  createdAt: string;
}

// Medical Record
export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  prescription: Prescription[];
  labTests: LabTest[];
  notes: string;
}

// Prescription
export interface Prescription {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// Appointment
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'opd' | 'follow-up' | 'emergency';
  tokenNumber?: number;
  notes?: string;
}

// Lab Test
export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testName: string;
  testType: string;
  status: 'requested' | 'sample-collected' | 'processing' | 'completed';
  requestDate: string;
  completedDate?: string;
  result?: string;
  reportUrl?: string;
  cost: number;
  notes?: string;
}

// Medicine
export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
}

// Bill
export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'partial' | 'cancelled';
  paymentMethod?: string;
  insuranceClaim?: boolean;
}

export interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Bed/Ward
export interface Bed {
  id: string;
  wardId: string;
  wardName: string;
  bedNumber: string;
  status: 'available' | 'occupied' | 'maintenance';
  patientId?: string;
  patientName?: string;
}

// Vitals
export interface Vitals {
  id: string;
  patientId: string;
  nurseId: string;
  recordedAt: string;
  bloodPressure: string;
  temperature: number;
  pulse: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight?: number;
  notes?: string;
}

// Department
export interface Department {
  id: string;
  name: string;
  head: string;
  description: string;
  doctorCount: number;
  nurseCount: number;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}
