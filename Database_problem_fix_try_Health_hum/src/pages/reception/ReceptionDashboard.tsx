import { useState } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getData, mockAppointments, mockPatients, mockDepartments } from '@/lib/mockData';
import { Appointment, Patient } from '@/types';
import { toast } from 'sonner';
 import { StaffCheckIn } from './StaffCheckIn';
 import { PatientSearch } from './PatientSearch';
import {
  LayoutDashboard,
  UserPlus,
  Calendar,
  Search,
  Clock,
  Users,
  CalendarPlus,
  Ticket,
  Phone,
  Mail,
   UserCheck,
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/reception', icon: LayoutDashboard },
  { title: 'New Patient', href: '/reception/register', icon: UserPlus },
  { title: 'Appointments', href: '/reception/appointments', icon: Calendar },
  { title: 'Patient Search', href: '/reception/search', icon: Search },
  { title: 'Token Queue', href: '/reception/queue', icon: Ticket },
   { title: 'Staff Check-In', href: '/reception/checkin', icon: UserCheck },
];

function ReceptionOverview() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const appointments = getData('appointments', mockAppointments);
  const patients = getData('patients', mockPatients);
  const departments = getData('departments', mockDepartments);

  const todayAppointments = appointments.filter(a => a.date === '2024-03-15');
  const waitingPatients = todayAppointments.filter(a => a.status === 'scheduled').length;
  const currentToken = todayAppointments.find(a => a.status === 'in-progress')?.tokenNumber || 0;

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Appointments"
          value={todayAppointments.length}
          description="Scheduled for today"
          icon={Calendar}
        />
        <StatsCard
          title="Patients Waiting"
          value={waitingPatients}
          description="In queue"
          icon={Clock}
        />
        <StatsCard
          title="Current Token"
          value={`#${currentToken}`}
          description="Now serving"
          icon={Ticket}
        />
        <StatsCard
          title="Total Patients"
          value={patients.length}
          description="Registered"
          icon={Users}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/reception/register')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Register New Patient</h3>
              <p className="text-sm text-muted-foreground">Add a new patient to the system</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/reception/appointments')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CalendarPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Book Appointment</h3>
              <p className="text-sm text-muted-foreground">Schedule a new appointment</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/reception/queue')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Generate Token</h3>
              <p className="text-sm text-muted-foreground">Issue OPD token for walk-in</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Queue</CardTitle>
            <CardDescription>OPD patient queue for today</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <Badge variant={apt.status === 'in-progress' ? 'default' : 'outline'}>
                        #{apt.tokenNumber}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{apt.patientName}</TableCell>
                    <TableCell>{apt.doctorName}</TableCell>
                    <TableCell>
                      <StatusBadge status={apt.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Patient Search */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Patient Search</CardTitle>
            <CardDescription>Find patients by name, phone, or email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              {(searchQuery ? filteredPatients : patients).slice(0, 4).map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {patient.email}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/reception/register')}>View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PatientRegistration() {
  const { data: patients, addItem, updateItem, deleteItem } = useLocalStorage<Patient>('patients', mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '' as Patient['gender'],
    bloodGroup: '',
    address: '',
    emergencyContact: '',
  });

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  const columns: Column<Patient>[] = [
    { key: 'name', header: 'Name', render: (p) => <span className="font-medium">{p.name}</span> },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'gender', header: 'Gender', render: (p) => <span className="capitalize">{p.gender}</span> },
    { key: 'bloodGroup', header: 'Blood Group', render: (p) => <Badge variant="outline">{p.bloodGroup}</Badge> },
  ];

  const handleAdd = () => {
    setEditingPatient(null);
    setFormData({ name: '', email: '', phone: '', dateOfBirth: '', gender: '' as Patient['gender'], bloodGroup: '', address: '', emergencyContact: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    setDeletePatientId(patient.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletePatientId) {
      deleteItem(deletePatientId);
      toast.success('Patient deleted successfully');
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      updateItem(editingPatient.id, formData);
      toast.success('Patient updated successfully');
    } else {
      const newPatient: Patient = {
        id: `patient-${Date.now()}`,
        ...formData,
        medicalHistory: [],
        createdAt: new Date().toISOString().split('T')[0],
      };
      addItem(newPatient);
      toast.success('Patient registered successfully');
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Patient Registration"
        description="Register and manage patients"
        data={filteredPatients}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name or phone..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Register Patient"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPatient ? 'Edit Patient' : 'Register New Patient'}</DialogTitle>
            <DialogDescription>
              {editingPatient ? 'Update patient details.' : 'Enter patient information to register.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v as Patient['gender'] })}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v })}>
                    <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingPatient ? 'Update' : 'Register'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Delete Patient" description="Are you sure you want to delete this patient?" />
    </div>
  );
}

function AppointmentManagement() {
  const { data: appointments, addItem, updateItem, deleteItem } = useLocalStorage<Appointment>('appointments', mockAppointments);
  const patients = getData('patients', mockPatients);
  const departments = getData('departments', mockDepartments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [deleteAptId, setDeleteAptId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    department: '',
    date: '',
    time: '',
    type: 'opd' as Appointment['type'],
  });

  const filteredAppointments = appointments.filter(a =>
    a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Appointment>[] = [
    { key: 'tokenNumber', header: 'Token', render: (a) => <Badge variant="outline">#{a.tokenNumber}</Badge> },
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName', header: 'Doctor' },
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time' },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  ];

  const handleAdd = () => {
    setEditingApt(null);
    setFormData({ patientId: '', department: '', date: '', time: '', type: 'opd' });
    setIsFormOpen(true);
  };

  const handleEdit = (apt: Appointment) => {
    setEditingApt(apt);
    setFormData({
      patientId: apt.patientId,
      department: apt.department,
      date: apt.date,
      time: apt.time,
      type: apt.type,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (apt: Appointment) => {
    setDeleteAptId(apt.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteAptId) {
      deleteItem(deleteAptId);
      toast.success('Appointment cancelled');
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    if (editingApt) {
      updateItem(editingApt.id, formData);
      toast.success('Appointment updated');
    } else {
      const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: formData.patientId,
        patientName: patient?.name || '',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Michael Chen',
        department: formData.department,
        date: formData.date,
        time: formData.time,
        status: 'scheduled',
        type: formData.type,
        tokenNumber: appointments.length + 1,
      };
      addItem(newApt);
      toast.success('Appointment booked');
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Appointments"
        description="Manage all appointments"
        data={filteredAppointments}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search appointments..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Book Appointment"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingApt ? 'Edit Appointment' : 'Book Appointment'}</DialogTitle>
            <DialogDescription>Schedule an appointment for a patient.</DialogDescription>
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
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Appointment['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opd">OPD</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingApt ? 'Update' : 'Book'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Cancel Appointment" description="Are you sure you want to cancel this appointment?" />
    </div>
  );
}

function TokenQueue() {
  const { data: appointments, updateItem } = useLocalStorage<Appointment>('appointments', mockAppointments);
  const { data: patients } = useLocalStorage('patients', mockPatients);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const todayAppointments = appointments.filter(a => a.date === '2024-03-15');
  const departments = getData('departments', mockDepartments);
  
  const filteredPatients = patients.filter((p: Patient) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone.includes(patientSearch)
  );

  const getNextToken = () => {
    const maxToken = todayAppointments.reduce((max, apt) => Math.max(max, apt.tokenNumber || 0), 0);
    return maxToken + 1;
  };

  const handleGenerateToken = () => {
    if (!selectedPatient || !selectedDepartment) {
      toast.error('Please select a patient and department');
      return;
    }
    
    const patient = patients.find((p: Patient) => p.id === selectedPatient);
    const department = departments.find(d => d.id === selectedDepartment);
    const newToken = getNextToken();
    
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: selectedPatient,
      patientName: patient?.name || 'Walk-in Patient',
      doctorId: `doc-${selectedDepartment}`,
      doctorName: department?.head || 'Assigned Doctor',
      department: department?.name || selectedDepartment,
      date: '2024-03-15',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'scheduled',
      type: 'opd',
      tokenNumber: newToken,
      notes: 'Walk-in patient',
    };
    
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    storedAppointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(storedAppointments));
    
    toast.success(`Token #${newToken} generated for ${patient?.name}`);
    setIsGenerateOpen(false);
    setSelectedPatient('');
    setSelectedDepartment('');
    setPatientSearch('');
    window.location.reload();
  };

  const handleCall = (apt: Appointment) => {
    updateItem(apt.id, { status: 'in-progress' });
    toast.success(`Called token #${apt.tokenNumber}`);
  };

  const handleComplete = (apt: Appointment) => {
    updateItem(apt.id, { status: 'completed' });
    toast.success(`Token #${apt.tokenNumber} completed`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Token Queue</h2>
        <p className="text-muted-foreground">Manage today's patient queue</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 text-center">
            <p className="text-sm opacity-80">Now Serving</p>
            <p className="text-5xl font-bold mt-2">
              #{todayAppointments.find(a => a.status === 'in-progress')?.tokenNumber || '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Waiting</p>
            <p className="text-5xl font-bold mt-2">{todayAppointments.filter(a => a.status === 'scheduled').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-5xl font-bold mt-2">{todayAppointments.filter(a => a.status === 'completed').length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setIsGenerateOpen(true)}>
          <Ticket className="h-4 w-4 mr-2" />
          Generate New Token
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell><Badge variant={apt.status === 'in-progress' ? 'default' : 'outline'}>#{apt.tokenNumber}</Badge></TableCell>
                  <TableCell className="font-medium">{apt.patientName}</TableCell>
                  <TableCell>{apt.doctorName}</TableCell>
                  <TableCell><StatusBadge status={apt.status} /></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {apt.status === 'scheduled' && (
                        <Button size="sm" onClick={() => handleCall(apt)}>Call</Button>
                      )}
                      {apt.status === 'in-progress' && (
                        <Button size="sm" onClick={() => handleComplete(apt)}>Complete</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate OPD Token</DialogTitle>
            <DialogDescription>Issue a token for a walk-in patient</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Search Patient</Label>
              <Input 
                placeholder="Search by name or phone..." 
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              {patientSearch && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {filteredPatients.slice(0, 5).map((patient: Patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${selectedPatient === patient.id ? 'bg-primary/10' : ''}`}
                      onClick={() => {
                        setSelectedPatient(patient.id);
                        setPatientSearch(patient.name);
                      }}
                    >
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Next Token Number</p>
              <p className="text-4xl font-bold text-primary">#{getNextToken()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateToken}>
              <Ticket className="h-4 w-4 mr-2" />
              Generate Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

export default function ReceptionDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Reception Dashboard">
      <Routes>
        <Route index element={<ReceptionOverview />} />
        <Route path="register" element={<PatientRegistration />} />
        <Route path="appointments" element={<AppointmentManagement />} />
         <Route path="search" element={<PatientSearch />} />
        <Route path="queue" element={<TokenQueue />} />
         <Route path="checkin" element={<StaffCheckIn />} />
      </Routes>
    </DashboardLayout>
  );
}
