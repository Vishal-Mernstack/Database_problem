import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getData, mockPatients, mockMedicines } from '@/lib/mockData';
import { toast } from 'sonner';
import { Plus, Trash2, Printer, Eye, Search, Pill, X } from 'lucide-react';

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

const initialPrescriptions: Prescription[] = [
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
  {
    id: 'presc-2',
    patientId: 'patient-2',
    patientName: 'Mary Johnson',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Michael Chen',
    date: '2024-03-14',
    diagnosis: 'Type 2 Diabetes',
    notes: 'Monitor blood sugar levels',
    status: 'active',
    items: [
      { medicineId: 'med-3', medicineName: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '60 days', instructions: 'Take with meals' },
    ]
  }
];

export function DoctorPrescriptions() {
  const { data: prescriptions, addItem, updateItem, deleteItem } = useLocalStorage<Prescription>('prescriptions', initialPrescriptions);
  const patients = getData('patients', mockPatients);
  const medicines = getData('medicines', mockMedicines);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    notes: '',
    items: [] as PrescriptionItem[],
  });
  
  const [currentItem, setCurrentItem] = useState<PrescriptionItem>({
    medicineId: '',
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMedicine = () => {
    if (!currentItem.medicineId || !currentItem.dosage) {
      toast.error('Please select medicine and enter dosage');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, currentItem]
    }));
    setCurrentItem({
      medicineId: '',
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
  };

  const handleRemoveMedicine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }
    
    const patient = patients.find(p => p.id === formData.patientId);
    const newPrescription: Prescription = {
      id: `presc-${Date.now()}`,
      patientId: formData.patientId,
      patientName: patient?.name || 'Unknown',
      doctorId: 'doctor-1',
      doctorName: 'Dr. Michael Chen',
      date: new Date().toISOString().split('T')[0],
      diagnosis: formData.diagnosis,
      notes: formData.notes,
      status: 'active',
      items: formData.items,
    };
    
    addItem(newPrescription);
    toast.success('Prescription created successfully');
    setIsFormOpen(false);
    setFormData({ patientId: '', diagnosis: '', notes: '', items: [] });
  };

  const handleView = (prescription: Prescription) => {
    setViewingPrescription(prescription);
    setIsViewOpen(true);
  };

  const handlePrint = (prescription: Prescription) => {
    const printContent = `
      <html>
        <head>
          <title>Prescription - ${prescription.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #0891b2; }
            .header { border-bottom: 2px solid #0891b2; padding-bottom: 20px; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f0f9ff; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MediCare Hospital</h1>
            <p>Medical Prescription</p>
          </div>
          <div class="info">
            <p><strong>Patient:</strong> ${prescription.patientName}</p>
            <p><strong>Date:</strong> ${new Date(prescription.date).toLocaleDateString()}</p>
            <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
            <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
          </div>
          <table>
            <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>
            ${prescription.items.map(item => `
              <tr>
                <td>${item.medicineName}</td>
                <td>${item.dosage}</td>
                <td>${item.frequency}</td>
                <td>${item.duration}</td>
                <td>${item.instructions}</td>
              </tr>
            `).join('')}
          </table>
          <p style="margin-top: 20px;"><strong>Notes:</strong> ${prescription.notes}</p>
          <p style="margin-top: 40px;">_________________________<br/>Doctor's Signature</p>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Prescriptions</h2>
          <p className="text-muted-foreground">Create and manage patient prescriptions</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search prescriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredPrescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{prescription.patientName}</CardTitle>
                  <CardDescription>{prescription.diagnosis}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                    {prescription.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(prescription.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {prescription.items.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="gap-1">
                    <Pill className="h-3 w-3" />
                    {item.medicineName} - {item.dosage}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleView(prescription)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" onClick={() => handlePrint(prescription)}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredPrescriptions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No prescriptions found
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Prescription Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Prescription</DialogTitle>
            <DialogDescription>Create a prescription for a patient</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={formData.patientId} onValueChange={(v) => setFormData({ ...formData, patientId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <Input 
                    value={formData.diagnosis} 
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold">Add Medicines</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Medicine</Label>
                    <Select 
                      value={currentItem.medicineId} 
                      onValueChange={(v) => {
                        const med = medicines.find(m => m.id === v);
                        setCurrentItem({ ...currentItem, medicineId: v, medicineName: med?.name || '' });
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger>
                      <SelectContent>
                        {medicines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input 
                      value={currentItem.dosage} 
                      onChange={(e) => setCurrentItem({ ...currentItem, dosage: e.target.value })}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={currentItem.frequency} onValueChange={(v) => setCurrentItem({ ...currentItem, frequency: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input 
                      value={currentItem.duration} 
                      onChange={(e) => setCurrentItem({ ...currentItem, duration: e.target.value })}
                      placeholder="e.g., 7 days"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Input 
                      value={currentItem.instructions} 
                      onChange={(e) => setCurrentItem({ ...currentItem, instructions: e.target.value })}
                      placeholder="e.g., After meals"
                    />
                  </div>
                </div>
                <Button type="button" variant="secondary" onClick={handleAddMedicine}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </div>

              {formData.items.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Prescription Items</h4>
                  <div className="space-y-2">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="font-medium">{item.medicineName}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{item.dosage} • {item.frequency}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMedicine(idx)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional instructions or notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Create Prescription</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Prescription Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {viewingPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Patient</Label>
                  <p className="font-medium">{viewingPrescription.patientName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{new Date(viewingPrescription.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Diagnosis</Label>
                  <p className="font-medium">{viewingPrescription.diagnosis}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Doctor</Label>
                  <p className="font-medium">{viewingPrescription.doctorName}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Medicines</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingPrescription.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.medicineName}</TableCell>
                        <TableCell>{item.dosage}</TableCell>
                        <TableCell>{item.frequency}</TableCell>
                        <TableCell>{item.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {viewingPrescription.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p>{viewingPrescription.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handlePrint(viewingPrescription)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
