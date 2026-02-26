import {
  BloodInventory,
  BloodDonor,
  BloodCollection,
  BloodTest,
  BloodStorage,
  BloodIssue,
  BloodRequest,
  BloodActivityLog,
} from '@/types/bloodBank';

export const mockBloodInventory: BloodInventory[] = [
  { id: 'bi-1', bloodGroup: 'A+', units: 25, lastUpdated: '2024-03-15', lowStockThreshold: 10 },
  { id: 'bi-2', bloodGroup: 'A-', units: 8, lastUpdated: '2024-03-15', lowStockThreshold: 5 },
  { id: 'bi-3', bloodGroup: 'B+', units: 20, lastUpdated: '2024-03-15', lowStockThreshold: 10 },
  { id: 'bi-4', bloodGroup: 'B-', units: 4, lastUpdated: '2024-03-14', lowStockThreshold: 5 },
  { id: 'bi-5', bloodGroup: 'AB+', units: 12, lastUpdated: '2024-03-15', lowStockThreshold: 5 },
  { id: 'bi-6', bloodGroup: 'AB-', units: 3, lastUpdated: '2024-03-13', lowStockThreshold: 3 },
  { id: 'bi-7', bloodGroup: 'O+', units: 30, lastUpdated: '2024-03-15', lowStockThreshold: 15 },
  { id: 'bi-8', bloodGroup: 'O-', units: 6, lastUpdated: '2024-03-14', lowStockThreshold: 8 },
];

export const mockBloodDonors: BloodDonor[] = [
  {
    id: 'donor-1', name: 'Rajesh Kumar', phone: '+91-98765-43210', email: 'rajesh.k@email.com',
    bloodGroup: 'O+', dateOfBirth: '1990-05-12', gender: 'male',
    address: '45 MG Road, Delhi 110001', eligibleToDonate: true,
    lastDonationDate: '2024-01-10', nextEligibleDate: '2024-04-10', totalDonations: 8, createdAt: '2023-01-15',
  },
  {
    id: 'donor-2', name: 'Priya Sharma', phone: '+91-98765-43211', email: 'priya.s@email.com',
    bloodGroup: 'A+', dateOfBirth: '1988-08-22', gender: 'female',
    address: '12 Nehru Nagar, Mumbai 400001', eligibleToDonate: true,
    lastDonationDate: '2024-02-15', nextEligibleDate: '2024-05-15', totalDonations: 5, createdAt: '2023-03-20',
  },
  {
    id: 'donor-3', name: 'Amit Patel', phone: '+91-98765-43212', email: 'amit.p@email.com',
    bloodGroup: 'B+', dateOfBirth: '1995-11-03', gender: 'male',
    address: '78 Gandhi Nagar, Ahmedabad 380001', eligibleToDonate: false,
    lastDonationDate: '2024-03-01', nextEligibleDate: '2024-06-01', totalDonations: 3, createdAt: '2023-06-10',
  },
  {
    id: 'donor-4', name: 'Sunita Devi', phone: '+91-98765-43213', email: 'sunita.d@email.com',
    bloodGroup: 'AB+', dateOfBirth: '1992-02-28', gender: 'female',
    address: '33 Lal Bagh, Bengaluru 560001', eligibleToDonate: true,
    lastDonationDate: '2023-12-20', nextEligibleDate: '2024-03-20', totalDonations: 6, createdAt: '2022-11-05',
  },
];

export const mockBloodCollections: BloodCollection[] = [
  { id: 'bc-1', donorId: 'donor-1', donorName: 'Rajesh Kumar', bloodGroup: 'O+', collectionDate: '2024-03-14', quantity: 450, bagId: 'BAG-2024-001', screeningStatus: 'passed' },
  { id: 'bc-2', donorId: 'donor-2', donorName: 'Priya Sharma', bloodGroup: 'A+', collectionDate: '2024-03-15', quantity: 450, bagId: 'BAG-2024-002', screeningStatus: 'passed' },
  { id: 'bc-3', donorId: 'donor-4', donorName: 'Sunita Devi', bloodGroup: 'AB+', collectionDate: '2024-03-15', quantity: 350, bagId: 'BAG-2024-003', screeningStatus: 'pending' },
];

export const mockBloodTests: BloodTest[] = [
  { id: 'bt-1', bagId: 'BAG-2024-001', donorName: 'Rajesh Kumar', bloodGroup: 'O+', testDate: '2024-03-14', hivTest: 'negative', hepatitisB: 'negative', hepatitisC: 'negative', syphilis: 'negative', malaria: 'negative', overallStatus: 'approved', verifiedBy: 'Dr. Anil Gupta' },
  { id: 'bt-2', bagId: 'BAG-2024-002', donorName: 'Priya Sharma', bloodGroup: 'A+', testDate: '2024-03-15', hivTest: 'negative', hepatitisB: 'negative', hepatitisC: 'pending', syphilis: 'negative', malaria: 'negative', overallStatus: 'pending' },
  { id: 'bt-3', bagId: 'BAG-2024-003', donorName: 'Sunita Devi', bloodGroup: 'AB+', testDate: '2024-03-15', hivTest: 'pending', hepatitisB: 'pending', hepatitisC: 'pending', syphilis: 'pending', malaria: 'pending', overallStatus: 'pending' },
];

export const mockBloodStorage: BloodStorage[] = [
  { id: 'bs-1', bagId: 'BAG-2024-001', bloodGroup: 'O+', storageLocation: 'refrigerator', storedDate: '2024-03-14', expiryDate: '2024-04-25', status: 'stored' },
  { id: 'bs-2', bagId: 'BAG-2023-050', bloodGroup: 'B+', storageLocation: 'refrigerator', storedDate: '2024-02-10', expiryDate: '2024-03-20', status: 'stored' },
  { id: 'bs-3', bagId: 'BAG-2023-045', bloodGroup: 'A-', storageLocation: 'freezer', storedDate: '2024-01-15', expiryDate: '2024-03-16', status: 'expired', disposalDate: '2024-03-16', disposalReason: 'Expired' },
];

export const mockBloodIssues: BloodIssue[] = [
  { id: 'issue-1', bagId: 'BAG-2024-010', bloodGroup: 'O+', patientId: 'patient-1', patientName: 'Arjun Mehta', patientBloodGroup: 'O+', issuedDate: '2024-03-15', issuedBy: 'Dr. Anil Gupta', purpose: 'surgery', isEmergency: false, crossMatchResult: 'compatible' },
  { id: 'issue-2', bagId: 'BAG-2024-011', bloodGroup: 'O-', patientId: 'patient-3', patientName: 'Vikram Singh', patientBloodGroup: 'B-', issuedDate: '2024-03-14', issuedBy: 'Dr. Kavita Rao', purpose: 'emergency', isEmergency: true, crossMatchResult: 'compatible', notes: 'Accident case, universal donor blood used' },
];

export const mockBloodRequests: BloodRequest[] = [
  { id: 'req-1', requestedBy: 'Dr. Anil Gupta', requestedByRole: 'Doctor', patientId: 'patient-2', patientName: 'Meera Joshi', bloodGroup: 'A+', units: 2, priority: 'normal', requestDate: '2024-03-15', status: 'pending', notes: 'Scheduled surgery' },
  { id: 'req-2', requestedBy: 'Dr. Kavita Rao', requestedByRole: 'Doctor', patientId: 'patient-3', patientName: 'Vikram Singh', bloodGroup: 'B-', units: 3, priority: 'emergency', requestDate: '2024-03-14', status: 'approved', approvedBy: 'Blood Bank Admin', approvedDate: '2024-03-14' },
  { id: 'req-3', requestedBy: 'Ward-3 Nurse', requestedByRole: 'Nurse', patientId: 'patient-1', patientName: 'Arjun Mehta', bloodGroup: 'O+', units: 1, priority: 'urgent', requestDate: '2024-03-15', status: 'fulfilled' },
];

export const mockActivityLogs: BloodActivityLog[] = [
  { id: 'log-1', action: 'Blood Collected', details: '450ml O+ from Rajesh Kumar (BAG-2024-001)', performedBy: 'Lab Tech Ravi', timestamp: '2024-03-14T09:30:00' },
  { id: 'log-2', action: 'Blood Test Approved', details: 'BAG-2024-001 passed all screening tests', performedBy: 'Dr. Anil Gupta', timestamp: '2024-03-14T14:00:00' },
  { id: 'log-3', action: 'Blood Issued', details: '1 unit O+ issued to Arjun Mehta for surgery', performedBy: 'Dr. Anil Gupta', timestamp: '2024-03-15T08:00:00' },
  { id: 'log-4', action: 'Blood Request', details: '2 units A+ requested by Dr. Anil Gupta for Meera Joshi', performedBy: 'Dr. Anil Gupta', timestamp: '2024-03-15T10:00:00' },
  { id: 'log-5', action: 'Blood Expired', details: 'BAG-2023-045 (A-) expired and disposed', performedBy: 'System', timestamp: '2024-03-16T00:00:00' },
];
