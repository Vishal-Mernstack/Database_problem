// Blood Bank Types

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodInventory {
  id: string;
  bloodGroup: BloodGroup;
  units: number;
  lastUpdated: string;
  lowStockThreshold: number;
}

export interface BloodDonor {
  id: string;
  name: string;
  phone: string;
  email: string;
  bloodGroup: BloodGroup;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  eligibleToDonate: boolean;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  totalDonations: number;
  createdAt: string;
}

export interface BloodCollection {
  id: string;
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  collectionDate: string;
  quantity: number; // in ml
  bagId: string;
  screeningStatus: 'pending' | 'passed' | 'failed';
  notes?: string;
}

export interface BloodTest {
  id: string;
  bagId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  testDate: string;
  hivTest: 'pending' | 'negative' | 'positive';
  hepatitisB: 'pending' | 'negative' | 'positive';
  hepatitisC: 'pending' | 'negative' | 'positive';
  syphilis: 'pending' | 'negative' | 'positive';
  malaria: 'pending' | 'negative' | 'positive';
  overallStatus: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  notes?: string;
}

export interface BloodStorage {
  id: string;
  bagId: string;
  bloodGroup: BloodGroup;
  storageLocation: 'refrigerator' | 'freezer' | 'platelet-agitator';
  storedDate: string;
  expiryDate: string;
  status: 'stored' | 'expired' | 'issued' | 'disposed';
  disposalDate?: string;
  disposalReason?: string;
}

export interface BloodIssue {
  id: string;
  bagId: string;
  bloodGroup: BloodGroup;
  patientId: string;
  patientName: string;
  patientBloodGroup: BloodGroup;
  issuedDate: string;
  issuedBy: string;
  purpose: 'transfusion' | 'surgery' | 'emergency';
  isEmergency: boolean;
  crossMatchResult: 'compatible' | 'incompatible';
  notes?: string;
}

export interface BloodRequest {
  id: string;
  requestedBy: string;
  requestedByRole: string;
  patientId: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  priority: 'normal' | 'urgent' | 'emergency';
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}

export interface BloodActivityLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
}
