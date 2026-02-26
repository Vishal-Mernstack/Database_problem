import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { Pill, Clock, CheckCircle, AlertCircle, Search, User } from 'lucide-react';

interface MedicationSchedule {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  medicineName: string;
  dosage: string;
  route: 'oral' | 'iv' | 'injection' | 'topical';
  scheduledTime: string;
  status: 'pending' | 'administered' | 'missed' | 'held';
  administeredAt?: string;
  administeredBy?: string;
  notes?: string;
}

const initialSchedule: MedicationSchedule[] = [
  { id: 'med-1', patientId: 'p1', patientName: 'John Smith', bedNumber: 'A-101', medicineName: 'Lisinopril', dosage: '10mg', route: 'oral', scheduledTime: '08:00', status: 'administered', administeredAt: '08:05', administeredBy: 'Nurse Sarah' },
  { id: 'med-2', patientId: 'p1', patientName: 'John Smith', bedNumber: 'A-101', medicineName: 'Metformin', dosage: '500mg', route: 'oral', scheduledTime: '08:00', status: 'administered', administeredAt: '08:05', administeredBy: 'Nurse Sarah' },
  { id: 'med-3', patientId: 'p2', patientName: 'Mary Johnson', bedNumber: 'A-102', medicineName: 'Insulin', dosage: '10 units', route: 'injection', scheduledTime: '07:30', status: 'administered', administeredAt: '07:35', administeredBy: 'Nurse Sarah' },
  { id: 'med-4', patientId: 'p3', patientName: 'Robert Brown', bedNumber: 'B-201', medicineName: 'Ceftriaxone', dosage: '1g', route: 'iv', scheduledTime: '10:00', status: 'pending' },
  { id: 'med-5', patientId: 'p4', patientName: 'Emily Davis', bedNumber: 'B-202', medicineName: 'Aspirin', dosage: '81mg', route: 'oral', scheduledTime: '10:00', status: 'pending' },
  { id: 'med-6', patientId: 'p3', patientName: 'Robert Brown', bedNumber: 'B-201', medicineName: 'Pantoprazole', dosage: '40mg', route: 'oral', scheduledTime: '06:00', status: 'missed' },
  { id: 'med-7', patientId: 'p5', patientName: 'James Wilson', bedNumber: 'C-301', medicineName: 'Morphine', dosage: '5mg', route: 'iv', scheduledTime: '12:00', status: 'pending' },
  { id: 'med-8', patientId: 'p5', patientName: 'James Wilson', bedNumber: 'C-301', medicineName: 'Ondansetron', dosage: '4mg', route: 'iv', scheduledTime: '12:00', status: 'pending' },
];

export function NurseMedications() {
  const { data: schedule, updateItem } = useLocalStorage<MedicationSchedule>('medicationSchedule', initialSchedule);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdministerOpen, setIsAdministerOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationSchedule | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const filteredSchedule = schedule.filter(m =>
    m.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingMeds = filteredSchedule.filter(m => m.status === 'pending');
  const administeredMeds = filteredSchedule.filter(m => m.status === 'administered');
  const missedMeds = filteredSchedule.filter(m => m.status === 'missed');

  const groupedByPatient = pendingMeds.reduce((acc, med) => {
    if (!acc[med.patientId]) {
      acc[med.patientId] = { patientName: med.patientName, bedNumber: med.bedNumber, medications: [] };
    }
    acc[med.patientId].medications.push(med);
    return acc;
  }, {} as Record<string, { patientName: string; bedNumber: string; medications: MedicationSchedule[] }>);

  const handleAdminister = (medication: MedicationSchedule) => {
    setSelectedMedication(medication);
    setAdminNotes('');
    setIsAdministerOpen(true);
  };

  const confirmAdminister = () => {
    if (selectedMedication) {
      updateItem(selectedMedication.id, {
        status: 'administered',
        administeredAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        administeredBy: 'Current Nurse',
        notes: adminNotes,
      });
      toast.success(`${selectedMedication.medicineName} administered to ${selectedMedication.patientName}`);
      setIsAdministerOpen(false);
    }
  };

  const handleHold = (medication: MedicationSchedule) => {
    updateItem(medication.id, { status: 'held' });
    toast.info(`${medication.medicineName} held for ${medication.patientName}`);
  };

  const getRouteColor = (route: MedicationSchedule['route']) => {
    switch (route) {
      case 'iv': return 'bg-blue-100 text-blue-800';
      case 'injection': return 'bg-purple-100 text-purple-800';
      case 'oral': return 'bg-green-100 text-green-800';
      case 'topical': return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusBadge = (status: MedicationSchedule['status']) => {
    switch (status) {
      case 'administered':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Given</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-orange-500 text-orange-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'missed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Missed</Badge>;
      case 'held':
        return <Badge variant="secondary">Held</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Medication Administration</h2>
          <p className="text-muted-foreground">Manage and administer patient medications</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span>Pending: {pendingMeds.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Given: {administeredMeds.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span>Missed: {missedMeds.length}</span>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient or medicine..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Pending Medications by Patient */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Due Now
        </h3>
        {Object.entries(groupedByPatient).map(([patientId, { patientName, bedNumber, medications }]) => (
          <Card key={patientId}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{patientName}</CardTitle>
                  <CardDescription>Bed: {bedNumber}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary" />
                          {med.medicineName}
                        </div>
                      </TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>
                        <Badge className={getRouteColor(med.route)}>{med.route.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{med.scheduledTime}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAdminister(med)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Give
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleHold(med)}>
                            Hold
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
        {Object.keys(groupedByPatient).length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="font-medium">All medications administered!</p>
              <p className="text-sm">No pending medications at this time.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recently Administered */}
      {administeredMeds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recently Administered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Given At</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {administeredMeds.slice(0, 5).map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>{med.patientName}</TableCell>
                    <TableCell className="font-medium">{med.medicineName}</TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell>{med.administeredAt}</TableCell>
                    <TableCell>{med.administeredBy}</TableCell>
                    <TableCell>{getStatusBadge(med.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Administer Dialog */}
      <Dialog open={isAdministerOpen} onOpenChange={setIsAdministerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administer Medication</DialogTitle>
            <DialogDescription>Confirm medication administration</DialogDescription>
          </DialogHeader>
          {selectedMedication && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{selectedMedication.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bed</span>
                  <span className="font-medium">{selectedMedication.bedNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medicine</span>
                  <span className="font-medium">{selectedMedication.medicineName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dosage</span>
                  <span className="font-medium">{selectedMedication.dosage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <Badge className={getRouteColor(selectedMedication.route)}>{selectedMedication.route.toUpperCase()}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Any observations or notes..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdministerOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdminister} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Administration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
