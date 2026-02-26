import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getData, mockPatients } from '@/lib/mockData';
import { toast } from 'sonner';
import { Plus, Search, FileText, Activity, Stethoscope, Calendar, User } from 'lucide-react';

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  visitType: 'consultation' | 'follow-up' | 'emergency' | 'routine-checkup';
  chiefComplaint: string;
  symptoms: string[];
  vitals: {
    bloodPressure: string;
    temperature: string;
    pulse: string;
    weight: string;
    height: string;
  };
  diagnosis: string;
  treatment: string;
  notes: string;
}

const initialRecords: MedicalRecord[] = [
  {
    id: 'record-1',
    patientId: 'patient-1',
    patientName: 'John Smith',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Michael Chen',
    date: '2024-03-15',
    visitType: 'consultation',
    chiefComplaint: 'Headache and dizziness',
    symptoms: ['Headache', 'Dizziness', 'Fatigue'],
    vitals: { bloodPressure: '140/90', temperature: '98.6°F', pulse: '82 bpm', weight: '78 kg', height: '175 cm' },
    diagnosis: 'Hypertension - Stage 1',
    treatment: 'Lifestyle modifications and medication prescribed',
    notes: 'Patient advised to reduce salt intake and exercise regularly. Follow up in 2 weeks.',
  },
  {
    id: 'record-2',
    patientId: 'patient-2',
    patientName: 'Mary Johnson',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Michael Chen',
    date: '2024-03-14',
    visitType: 'follow-up',
    chiefComplaint: 'Follow-up for diabetes management',
    symptoms: ['Increased thirst', 'Frequent urination'],
    vitals: { bloodPressure: '125/82', temperature: '98.4°F', pulse: '76 bpm', weight: '68 kg', height: '162 cm' },
    diagnosis: 'Type 2 Diabetes - Well controlled',
    treatment: 'Continue current medication regimen',
    notes: 'HbA1c improved from 7.8% to 7.2%. Continue with current medications.',
  },
];

export function DoctorMedicalRecords() {
  const { data: records, addItem } = useLocalStorage<MedicalRecord>('medicalRecords', initialRecords);
  const patients = getData('patients', mockPatients);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    visitType: 'consultation' as MedicalRecord['visitType'],
    chiefComplaint: '',
    symptoms: [] as string[],
    vitals: { bloodPressure: '', temperature: '', pulse: '', weight: '', height: '' },
    diagnosis: '',
    treatment: '',
    notes: '',
  });

  const filteredRecords = records.filter(r =>
    r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedRecords = filteredRecords.reduce((acc, record) => {
    const key = record.patientId;
    if (!acc[key]) {
      acc[key] = { patientName: record.patientName, records: [] };
    }
    acc[key].records.push(record);
    return acc;
  }, {} as Record<string, { patientName: string; records: MedicalRecord[] }>);

  const handleAddSymptom = () => {
    if (symptomInput.trim()) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    
    const newRecord: MedicalRecord = {
      id: `record-${Date.now()}`,
      patientId: formData.patientId,
      patientName: patient?.name || 'Unknown',
      doctorId: 'doctor-1',
      doctorName: 'Dr. Michael Chen',
      date: new Date().toISOString().split('T')[0],
      ...formData,
    };
    
    addItem(newRecord);
    toast.success('Medical record created successfully');
    setIsFormOpen(false);
    setFormData({
      patientId: '',
      visitType: 'consultation',
      chiefComplaint: '',
      symptoms: [],
      vitals: { bloodPressure: '', temperature: '', pulse: '', weight: '', height: '' },
      diagnosis: '',
      treatment: '',
      notes: '',
    });
  };

  const getVisitTypeBadge = (type: MedicalRecord['visitType']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'consultation': 'default',
      'follow-up': 'secondary',
      'emergency': 'destructive',
      'routine-checkup': 'outline',
    };
    return <Badge variant={variants[type]}>{type.replace('-', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Medical Records</h2>
          <p className="text-muted-foreground">View and create patient medical records</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Record
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search records by patient or diagnosis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {Object.entries(groupedRecords).map(([patientId, { patientName, records: patientRecords }]) => (
          <AccordionItem key={patientId} value={patientId} className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{patientName}</p>
                  <p className="text-sm text-muted-foreground">{patientRecords.length} record(s)</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {patientRecords.map((record) => (
                  <Card key={record.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(record.date).toLocaleDateString()}</span>
                          {getVisitTypeBadge(record.visitType)}
                        </div>
                      </div>
                      <CardTitle className="text-base mt-2">{record.chiefComplaint}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-muted rounded-lg">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">BP</p>
                          <p className="font-medium text-sm">{record.vitals.bloodPressure}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Temp</p>
                          <p className="font-medium text-sm">{record.vitals.temperature}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Pulse</p>
                          <p className="font-medium text-sm">{record.vitals.pulse}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="font-medium text-sm">{record.vitals.weight}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Height</p>
                          <p className="font-medium text-sm">{record.vitals.height}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {record.symptoms.map((symptom, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{symptom}</Badge>
                        ))}
                      </div>
                      
                      <div className="grid gap-2">
                        <div className="flex items-start gap-2">
                          <Stethoscope className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Diagnosis</p>
                            <p className="text-sm">{record.diagnosis}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Activity className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Treatment</p>
                            <p className="text-sm">{record.treatment}</p>
                          </div>
                        </div>
                        {record.notes && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Notes</p>
                              <p className="text-sm">{record.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {Object.keys(groupedRecords).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No medical records found
          </CardContent>
        </Card>
      )}

      {/* Create Record Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Medical Record</DialogTitle>
            <DialogDescription>Create a medical record for a patient visit</DialogDescription>
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
                  <Label>Visit Type</Label>
                  <Select value={formData.visitType} onValueChange={(v) => setFormData({ ...formData, visitType: v as MedicalRecord['visitType'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="routine-checkup">Routine Checkup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Chief Complaint</Label>
                <Input 
                  value={formData.chiefComplaint} 
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })} 
                  placeholder="Main reason for visit"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Symptoms</Label>
                <div className="flex gap-2">
                  <Input 
                    value={symptomInput} 
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="Add a symptom"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSymptom())}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddSymptom}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.symptoms.map((symptom, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveSymptom(idx)}>
                      {symptom} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold">Vitals</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Blood Pressure</Label>
                    <Input 
                      value={formData.vitals.bloodPressure} 
                      onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, bloodPressure: e.target.value } })}
                      placeholder="120/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input 
                      value={formData.vitals.temperature} 
                      onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, temperature: e.target.value } })}
                      placeholder="98.6°F"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pulse</Label>
                    <Input 
                      value={formData.vitals.pulse} 
                      onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, pulse: e.target.value } })}
                      placeholder="72 bpm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <Input 
                      value={formData.vitals.weight} 
                      onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, weight: e.target.value } })}
                      placeholder="70 kg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <Input 
                      value={formData.vitals.height} 
                      onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, height: e.target.value } })}
                      placeholder="175 cm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Diagnosis</Label>
                <Input 
                  value={formData.diagnosis} 
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} 
                  placeholder="Enter diagnosis"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Treatment</Label>
                <Textarea 
                  value={formData.treatment} 
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="Treatment plan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
