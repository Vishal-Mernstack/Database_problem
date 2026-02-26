import { useState } from 'react';
import { NurseMedications } from './NurseMedications';
import { NurseNotes } from './NurseNotes';
import { NurseAlerts } from './NurseAlerts';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getData, mockPatients, mockBeds, mockVitals } from '@/lib/mockData';
import { Vitals, Bed } from '@/types';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  Activity,
  FileText,
  Bell,
  ClipboardList,
  Thermometer,
  Heart,
  Droplets,
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/nurse', icon: LayoutDashboard },
  { title: 'My Patients', href: '/nurse/patients', icon: Users },
  { title: 'Vitals Entry', href: '/nurse/vitals', icon: Activity },
  { title: 'Medications', href: '/nurse/medications', icon: ClipboardList },
  { title: 'Ward Status', href: '/nurse/wards', icon: BedDouble },
  { title: 'Nursing Notes', href: '/nurse/notes', icon: FileText },
  { title: 'Alerts', href: '/nurse/alerts', icon: Bell },
];

function NurseOverview() {
  const navigate = useNavigate();
  const patients = getData('patients', mockPatients);
  const beds = getData('beds', mockBeds);
  const vitals = getData('vitals', mockVitals);

  const assignedPatients = beds.filter(b => b.status === 'occupied').length;
  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.status === 'available').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Assigned Patients" value={assignedPatients} description="Under your care" icon={Users} />
        <StatsCard title="Available Beds" value={`${availableBeds}/${totalBeds}`} description="Ward capacity" icon={BedDouble} />
        <StatsCard title="Pending Vitals" value={3} description="Due for recording" icon={Activity} />
        <StatsCard title="Medications Due" value={5} description="Next 2 hours" icon={ClipboardList} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Assigned Patients</CardTitle>
            <CardDescription>Patients currently under your care</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Bed</TableHead>
                  <TableHead>Last Vitals</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beds.filter(b => b.status === 'occupied').map((bed) => {
                  const patientVitals = vitals.find(v => v.patientId === bed.patientId);
                  return (
                    <TableRow key={bed.id}>
                      <TableCell className="font-medium">{bed.patientName}</TableCell>
                      <TableCell><Badge variant="outline">{bed.bedNumber}</Badge></TableCell>
                      <TableCell className="text-sm">
                        {patientVitals ? (
                          <span>BP: {patientVitals.bloodPressure} | Temp: {patientVitals.temperature}°F</span>
                        ) : (
                          <span className="text-muted-foreground">Not recorded</span>
                        )}
                      </TableCell>
                      <TableCell><StatusBadge status="occupied" /></TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => navigate('/nurse/vitals')}>Record Vitals</Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Vitals</CardTitle>
            <CardDescription>Latest patient vitals recorded</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vitals.slice(0, 3).map((vital) => {
              const patient = patients.find(p => p.id === vital.patientId);
              return (
                <div key={vital.id} className="p-3 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{patient?.name || 'Unknown'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(vital.recordedAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2"><Heart className="h-4 w-4 text-destructive" /><span>BP: {vital.bloodPressure}</span></div>
                    <div className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-primary" /><span>{vital.temperature}°F</span></div>
                    <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /><span>Pulse: {vital.pulse}</span></div>
                    <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-primary" /><span>SpO2: {vital.oxygenSaturation}%</span></div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ward Bed Status</CardTitle>
          <CardDescription>Current bed availability across wards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {['General Ward A', 'ICU', 'Pediatric Ward'].map((ward) => {
              const wardBeds = beds.filter(b => b.wardName === ward);
              const occupied = wardBeds.filter(b => b.status === 'occupied').length;
              const total = wardBeds.length;
              const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;
              return (
                <div key={ward} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{ward}</span>
                    <Badge variant={occupancyRate > 80 ? 'destructive' : 'outline'}>{occupied}/{total}</Badge>
                  </div>
                  <Progress value={occupancyRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">{occupancyRate.toFixed(0)}% occupied</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VitalsEntry() {
  const { data: vitals, addItem, updateItem, deleteItem } = useLocalStorage<Vitals>('vitals', mockVitals);
  const patients = getData('patients', mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingVital, setEditingVital] = useState<Vitals | null>(null);
  const [deleteVitalId, setDeleteVitalId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    bloodPressure: '',
    temperature: 0,
    pulse: 0,
    respiratoryRate: 0,
    oxygenSaturation: 0,
    weight: 0,
    notes: '',
  });

  const filteredVitals = vitals.filter(v => {
    const patient = patients.find(p => p.id === v.patientId);
    return patient?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns: Column<Vitals>[] = [
    { key: 'patientId', header: 'Patient', render: (v) => <span className="font-medium">{patients.find(p => p.id === v.patientId)?.name || 'Unknown'}</span> },
    { key: 'bloodPressure', header: 'Blood Pressure' },
    { key: 'temperature', header: 'Temp (°F)' },
    { key: 'pulse', header: 'Pulse' },
    { key: 'oxygenSaturation', header: 'SpO2 %' },
    { key: 'recordedAt', header: 'Recorded', render: (v) => new Date(v.recordedAt).toLocaleString() },
  ];

  const handleAdd = () => {
    setEditingVital(null);
    setFormData({ patientId: '', bloodPressure: '', temperature: 98.6, pulse: 72, respiratoryRate: 16, oxygenSaturation: 98, weight: 0, notes: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (vital: Vitals) => {
    setEditingVital(vital);
    setFormData({
      patientId: vital.patientId,
      bloodPressure: vital.bloodPressure,
      temperature: vital.temperature,
      pulse: vital.pulse,
      respiratoryRate: vital.respiratoryRate,
      oxygenSaturation: vital.oxygenSaturation,
      weight: vital.weight || 0,
      notes: vital.notes || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (vital: Vitals) => {
    setDeleteVitalId(vital.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteVitalId) {
      deleteItem(deleteVitalId);
      toast.success('Vitals record deleted');
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVital) {
      updateItem(editingVital.id, formData);
      toast.success('Vitals updated');
    } else {
      const newVital: Vitals = {
        id: `vital-${Date.now()}`,
        ...formData,
        nurseId: 'nurse-1',
        recordedAt: new Date().toISOString(),
      };
      addItem(newVital);
      toast.success('Vitals recorded');
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Vitals Entry"
        description="Record and manage patient vitals"
        data={filteredVitals}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by patient name..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Record Vitals"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingVital ? 'Edit Vitals' : 'Record Vitals'}</DialogTitle>
            <DialogDescription>Enter patient vital signs.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select value={formData.patientId} onValueChange={(v) => setFormData({ ...formData, patientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>
                    {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blood Pressure</Label>
                  <Input value={formData.bloodPressure} onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })} placeholder="120/80" required />
                </div>
                <div className="space-y-2">
                  <Label>Temperature (°F)</Label>
                  <Input type="number" step="0.1" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pulse (bpm)</Label>
                  <Input type="number" value={formData.pulse} onChange={(e) => setFormData({ ...formData, pulse: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Respiratory Rate</Label>
                  <Input type="number" value={formData.respiratoryRate} onChange={(e) => setFormData({ ...formData, respiratoryRate: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>SpO2 (%)</Label>
                  <Input type="number" value={formData.oxygenSaturation} onChange={(e) => setFormData({ ...formData, oxygenSaturation: parseInt(e.target.value) })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingVital ? 'Update' : 'Record'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Delete Vitals" description="Are you sure you want to delete this vitals record?" />
    </div>
  );
}

function WardStatus() {
  const { data: beds, updateItem } = useLocalStorage<Bed>('beds', mockBeds);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBeds = beds.filter(b =>
    b.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.wardName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Bed>[] = [
    { key: 'bedNumber', header: 'Bed', render: (b) => <Badge variant="outline">{b.bedNumber}</Badge> },
    { key: 'wardName', header: 'Ward' },
    { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    { key: 'patientName', header: 'Patient', render: (b) => b.patientName || '-' },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Ward Status"
        description="View and manage ward beds"
        data={filteredBeds}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by bed or ward..."
      />
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">This feature is coming soon</p>
      </div>
    </div>
  );
}

export default function NurseDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Nurse Dashboard">
      <Routes>
        <Route index element={<NurseOverview />} />
        <Route path="patients" element={<NurseOverview />} />
        <Route path="vitals" element={<VitalsEntry />} />
        <Route path="medications" element={<NurseMedications />} />
        <Route path="wards" element={<WardStatus />} />
        <Route path="notes" element={<NurseNotes />} />
        <Route path="alerts" element={<NurseAlerts />} />
      </Routes>
    </DashboardLayout>
  );
}
