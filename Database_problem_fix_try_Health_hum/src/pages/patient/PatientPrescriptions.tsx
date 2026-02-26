import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getData } from '@/lib/mockData';
import { toast } from 'sonner';
import { Pill, Calendar, User, Download, RefreshCw } from 'lucide-react';
import { exportToPDF, generateTableHTML } from '@/lib/exportUtils';

interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  items: PrescriptionItem[];
  diagnosis: string;
  notes: string;
  status: 'active' | 'completed' | 'cancelled';
}

const defaultPrescriptions: Prescription[] = [
  {
    id: 'presc-1',
    patientId: 'patient-1',
    patientName: 'John Smith',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Michael Chen',
    date: '2024-03-15',
    diagnosis: 'Hypertension',
    notes: 'Follow up in 2 weeks',
    status: 'active',
    items: [
      { medicineId: 'med-1', medicineName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in morning with water' },
      { medicineId: 'med-2', medicineName: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take with food' },
    ]
  },
];

export default function PatientPrescriptions() {
  const { user } = useAuth();
  
  // Read prescriptions from shared storage
  const allPrescriptions: Prescription[] = getData('prescriptions', defaultPrescriptions);
  
  // Filter for current patient
  const prescriptions = allPrescriptions.filter(p => p.patientId === user?.id);

  const activePrescriptions = prescriptions.filter(p => p.status === 'active');
  const completedPrescriptions = prescriptions.filter(p => p.status !== 'active');

  const handleRefill = (prescription: Prescription) => {
    // Create a refill request (stored in localStorage for pharmacy to see)
    const refillRequests = JSON.parse(localStorage.getItem('refillRequests') || '[]');
    refillRequests.push({
      id: `refill-${Date.now()}`,
      prescriptionId: prescription.id,
      patientId: user?.id,
      patientName: user?.name,
      doctorName: prescription.doctorName,
      items: prescription.items,
      requestDate: new Date().toISOString(),
      status: 'pending',
    });
    localStorage.setItem('refillRequests', JSON.stringify(refillRequests));
    toast.success(`Refill request sent for prescription from ${prescription.doctorName}`);
  };

  const handleDownload = (prescription: Prescription) => {
    const medicineRows = prescription.items.map(m => [m.medicineName, m.dosage, m.frequency, m.duration]);
    const content = `
      <h2>Prescription Details</h2>
      <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
      <p><strong>Date:</strong> ${new Date(prescription.date).toLocaleDateString()}</p>
      <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
      <h3>Medications</h3>
      ${generateTableHTML(['Medicine', 'Dosage', 'Frequency', 'Duration'], medicineRows)}
      ${prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ''}
    `;
    exportToPDF(`Prescription - ${prescription.doctorName}`, content, `prescription_${prescription.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Prescriptions</h2>
        <p className="text-muted-foreground">View and manage your prescriptions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Pill className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activePrescriptions.length}</p>
              <p className="text-xs text-muted-foreground">Active Prescriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg">
              <Pill className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedPrescriptions.length}</p>
              <p className="text-xs text-muted-foreground">Past Prescriptions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {activePrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Prescriptions</CardTitle>
            <CardDescription>Current medications you are taking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePrescriptions.map((prescription) => (
              <div key={prescription.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{prescription.doctorName}</span>
                      {getStatusBadge(prescription.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(prescription.date).toLocaleDateString()}
                    </div>
                    <p className="text-sm mt-2"><span className="text-muted-foreground">Diagnosis:</span> {prescription.diagnosis}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(prescription)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleRefill(prescription)}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refill
                    </Button>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Medications:</p>
                  <div className="space-y-2">
                    {prescription.items.map((med, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary" />
                          <span className="font-medium">{med.medicineName}</span>
                          <Badge variant="outline">{med.dosage}</Badge>
                        </div>
                        <span className="text-muted-foreground">{med.frequency} • {med.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {completedPrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Prescriptions</CardTitle>
            <CardDescription>Previous prescriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedPrescriptions.map((prescription) => (
              <div key={prescription.id} className="p-4 border rounded-lg opacity-75">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{prescription.doctorName}</span>
                      {getStatusBadge(prescription.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(prescription.date).toLocaleDateString()}</p>
                    <p className="text-sm mt-1">{prescription.diagnosis}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {prescription.items.map(m => m.medicineName).join(', ')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(prescription)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {prescriptions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No prescriptions found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
