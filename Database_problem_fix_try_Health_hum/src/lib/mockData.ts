import { User, Patient, Appointment, Medicine, LabTest, Bill, Bed, Department, Vitals } from '@/types';

// Mock Users (credentials for login)
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@hospital.com',
    name: 'Dr. Suresh Gupta',
    role: 'admin',
    phone: '+91-98100-10001',
    createdAt: '2024-01-01',
  },
  {
    id: 'doctor-1',
    email: 'doctor@hospital.com',
    name: 'Dr. Anil Sharma',
    role: 'doctor',
    department: 'Cardiology',
    specialization: 'Cardiologist',
    phone: '+91-98100-10002',
    createdAt: '2024-01-15',
  },
  {
    id: 'doctor-2',
    email: 'doctor2@hospital.com',
    name: 'Dr. Kavita Rao',
    role: 'doctor',
    department: 'Neurology',
    specialization: 'Neurologist',
    phone: '+91-98100-10003',
    createdAt: '2024-02-01',
  },
  {
    id: 'receptionist-1',
    email: 'reception@hospital.com',
    name: 'Neha Verma',
    role: 'receptionist',
    phone: '+91-98100-10004',
    createdAt: '2024-01-20',
  },
  {
    id: 'nurse-1',
    email: 'nurse@hospital.com',
    name: 'Rekha Nair',
    role: 'nurse',
    department: 'General Ward',
    phone: '+91-98100-10005',
    createdAt: '2024-02-10',
  },
  {
    id: 'pharmacy-1',
    email: 'pharmacy@hospital.com',
    name: 'Ramesh Iyer',
    role: 'pharmacy',
    phone: '+91-98100-10006',
    createdAt: '2024-01-25',
  },
  {
    id: 'lab-1',
    email: 'lab@hospital.com',
    name: 'Deepak Joshi',
    role: 'laboratory',
    phone: '+91-98100-10007',
    createdAt: '2024-02-05',
  },
  {
    id: 'billing-1',
    email: 'billing@hospital.com',
    name: 'Pooja Malhotra',
    role: 'billing',
    phone: '+91-98100-10008',
    createdAt: '2024-02-15',
  },
  {
    id: 'patient-1',
    email: 'patient@email.com',
    name: 'Arjun Mehta',
    role: 'patient',
    phone: '+91-98200-20001',
    createdAt: '2024-03-01',
  },
  {
    id: 'bloodbank-1',
    email: 'bloodbank@hospital.com',
    name: 'Dr. Sanjay Reddy',
    role: 'bloodbank',
    phone: '+91-98100-10009',
    createdAt: '2024-02-20',
  },
];

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: 'patient-1',
    name: 'Arjun Mehta',
    email: 'patient@email.com',
    phone: '+91-98200-20001',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    bloodGroup: 'O+',
    address: '45 MG Road, Connaught Place, New Delhi 110001',
    emergencyContact: '+91-98200-20002',
    medicalHistory: [],
    createdAt: '2024-03-01',
  },
  {
    id: 'patient-2',
    name: 'Meera Joshi',
    email: 'meera.j@email.com',
    phone: '+91-98200-20003',
    dateOfBirth: '1990-03-22',
    gender: 'female',
    bloodGroup: 'A+',
    address: '12 Nehru Nagar, Andheri West, Mumbai 400058',
    emergencyContact: '+91-98200-20004',
    medicalHistory: [],
    createdAt: '2024-03-05',
  },
  {
    id: 'patient-3',
    name: 'Vikram Singh',
    email: 'vikram.s@email.com',
    phone: '+91-98200-20005',
    dateOfBirth: '1978-11-08',
    gender: 'male',
    bloodGroup: 'B-',
    address: '78 Gandhi Nagar, Sector 15, Bengaluru 560001',
    emergencyContact: '+91-98200-20006',
    medicalHistory: [],
    createdAt: '2024-03-10',
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'patient-1',
    patientName: 'Arjun Mehta',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Anil Sharma',
    department: 'Cardiology',
    date: '2024-03-15',
    time: '09:00',
    status: 'scheduled',
    type: 'opd',
    tokenNumber: 1,
  },
  {
    id: 'apt-2',
    patientId: 'patient-2',
    patientName: 'Meera Joshi',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Anil Sharma',
    department: 'Cardiology',
    date: '2024-03-15',
    time: '09:30',
    status: 'scheduled',
    type: 'opd',
    tokenNumber: 2,
  },
  {
    id: 'apt-3',
    patientId: 'patient-3',
    patientName: 'Vikram Singh',
    doctorId: 'doctor-2',
    doctorName: 'Dr. Kavita Rao',
    department: 'Neurology',
    date: '2024-03-15',
    time: '10:00',
    status: 'in-progress',
    type: 'follow-up',
    tokenNumber: 1,
  },
];

// Mock Medicines
export const mockMedicines: Medicine[] = [
  {
    id: 'med-1',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    manufacturer: 'Cipla Ltd',
    batchNumber: 'AMX-2024-001',
    expiryDate: '2025-06-30',
    quantity: 500,
    unitPrice: 12.50,
    reorderLevel: 100,
  },
  {
    id: 'med-2',
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine',
    category: 'Cardiovascular',
    manufacturer: 'Sun Pharma',
    batchNumber: 'AML-2024-002',
    expiryDate: '2025-08-15',
    quantity: 300,
    unitPrice: 25.00,
    reorderLevel: 50,
  },
  {
    id: 'med-3',
    name: 'Metformin 850mg',
    genericName: 'Metformin',
    category: 'Diabetes',
    manufacturer: 'Dr. Reddy\'s',
    batchNumber: 'MET-2024-003',
    expiryDate: '2025-04-20',
    quantity: 45,
    unitPrice: 18.75,
    reorderLevel: 75,
  },
];

// Mock Lab Tests
export const mockLabTests: LabTest[] = [
  {
    id: 'lab-1',
    patientId: 'patient-1',
    patientName: 'Arjun Mehta',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Anil Sharma',
    testName: 'Complete Blood Count',
    testType: 'Hematology',
    status: 'completed',
    requestDate: '2024-03-14',
    completedDate: '2024-03-14',
    result: 'Normal',
    cost: 500,
  },
  {
    id: 'lab-2',
    patientId: 'patient-2',
    patientName: 'Meera Joshi',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Anil Sharma',
    testName: 'Lipid Panel',
    testType: 'Biochemistry',
    status: 'processing',
    requestDate: '2024-03-15',
    cost: 750,
  },
  {
    id: 'lab-3',
    patientId: 'patient-3',
    patientName: 'Vikram Singh',
    doctorId: 'doctor-2',
    doctorName: 'Dr. Kavita Rao',
    testName: 'MRI Brain',
    testType: 'Radiology',
    status: 'requested',
    requestDate: '2024-03-15',
    cost: 5000,
  },
];

// Mock Bills
export const mockBills: Bill[] = [
  {
    id: 'bill-1',
    patientId: 'patient-1',
    patientName: 'Arjun Mehta',
    date: '2024-03-15',
    items: [
      { description: 'Consultation Fee', quantity: 1, unitPrice: 500, total: 500 },
      { description: 'Blood Test', quantity: 1, unitPrice: 500, total: 500 },
    ],
    subtotal: 1000,
    discount: 0,
    tax: 100,
    total: 1100,
    status: 'paid',
    paymentMethod: 'UPI',
  },
  {
    id: 'bill-2',
    patientId: 'patient-2',
    patientName: 'Meera Joshi',
    date: '2024-03-15',
    items: [
      { description: 'Consultation Fee', quantity: 1, unitPrice: 500, total: 500 },
      { description: 'Lipid Panel', quantity: 1, unitPrice: 750, total: 750 },
      { description: 'ECG', quantity: 1, unitPrice: 800, total: 800 },
    ],
    subtotal: 2050,
    discount: 200,
    tax: 185,
    total: 2035,
    status: 'pending',
  },
];

// Mock Beds
export const mockBeds: Bed[] = [
  { id: 'bed-1', wardId: 'ward-1', wardName: 'General Ward A', bedNumber: 'A-101', status: 'available' },
  { id: 'bed-2', wardId: 'ward-1', wardName: 'General Ward A', bedNumber: 'A-102', status: 'occupied', patientId: 'patient-1', patientName: 'Arjun Mehta' },
  { id: 'bed-3', wardId: 'ward-1', wardName: 'General Ward A', bedNumber: 'A-103', status: 'available' },
  { id: 'bed-4', wardId: 'ward-2', wardName: 'ICU', bedNumber: 'ICU-01', status: 'occupied', patientId: 'patient-3', patientName: 'Vikram Singh' },
  { id: 'bed-5', wardId: 'ward-2', wardName: 'ICU', bedNumber: 'ICU-02', status: 'maintenance' },
  { id: 'bed-6', wardId: 'ward-3', wardName: 'Pediatric Ward', bedNumber: 'P-101', status: 'available' },
];

// Mock Departments
export const mockDepartments: Department[] = [
  { id: 'dept-1', name: 'Cardiology', head: 'Dr. Anil Sharma', description: 'Heart and cardiovascular care', doctorCount: 5, nurseCount: 8 },
  { id: 'dept-2', name: 'Neurology', head: 'Dr. Kavita Rao', description: 'Brain and nervous system care', doctorCount: 4, nurseCount: 6 },
  { id: 'dept-3', name: 'Orthopedics', head: 'Dr. Rajesh Kapoor', description: 'Bone and joint care', doctorCount: 6, nurseCount: 10 },
  { id: 'dept-4', name: 'Pediatrics', head: 'Dr. Sunita Devi', description: 'Child healthcare', doctorCount: 4, nurseCount: 8 },
  { id: 'dept-5', name: 'Emergency', head: 'Dr. Manoj Kumar', description: '24/7 emergency care', doctorCount: 8, nurseCount: 15 },
];

// Mock Vitals
export const mockVitals: Vitals[] = [
  {
    id: 'vital-1',
    patientId: 'patient-1',
    nurseId: 'nurse-1',
    recordedAt: '2024-03-15T08:00:00',
    bloodPressure: '120/80',
    temperature: 98.6,
    pulse: 72,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    weight: 75,
  },
  {
    id: 'vital-2',
    patientId: 'patient-3',
    nurseId: 'nurse-1',
    recordedAt: '2024-03-15T08:30:00',
    bloodPressure: '140/90',
    temperature: 99.1,
    pulse: 85,
    respiratoryRate: 18,
    oxygenSaturation: 96,
    notes: 'Patient showing elevated BP, monitoring closely',
  },
];

// Helper function to get data from localStorage or use mock data
export function getData<T>(key: string, mockData: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(key, JSON.stringify(mockData));
  return mockData;
}

// Helper function to save data to localStorage
export function saveData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize all mock data
export function initializeMockData(): void {
  if (!localStorage.getItem('initialized')) {
    localStorage.setItem('users', JSON.stringify(mockUsers));
    localStorage.setItem('patients', JSON.stringify(mockPatients));
    localStorage.setItem('appointments', JSON.stringify(mockAppointments));
    localStorage.setItem('medicines', JSON.stringify(mockMedicines));
    localStorage.setItem('labTests', JSON.stringify(mockLabTests));
    localStorage.setItem('bills', JSON.stringify(mockBills));
    localStorage.setItem('beds', JSON.stringify(mockBeds));
    localStorage.setItem('departments', JSON.stringify(mockDepartments));
    localStorage.setItem('vitals', JSON.stringify(mockVitals));
    localStorage.setItem('initialized', 'true');
  }
}
