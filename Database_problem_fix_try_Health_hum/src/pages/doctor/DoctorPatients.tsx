import { useState } from 'react';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockPatients } from '@/lib/mockData';
import { Patient } from '@/types';
import { toast } from 'sonner';

export function DoctorPatients() {
  const { data: patients, addItem, updateItem, deleteItem } = useLocalStorage<Patient>('patients', mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);

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
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  const columns: Column<Patient>[] = [
    { key: 'name', header: 'Name', render: (p) => <span className="font-medium">{p.name}</span> },
    { key: 'phone', header: 'Phone' },
    { key: 'gender', header: 'Gender', render: (p) => <span className="capitalize">{p.gender}</span> },
    { key: 'bloodGroup', header: 'Blood Group', render: (p) => <Badge variant="outline">{p.bloodGroup}</Badge> },
    { key: 'dateOfBirth', header: 'DOB', render: (p) => new Date(p.dateOfBirth).toLocaleDateString() },
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
      setDeletePatientId(null);
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
        title="Patients"
        description="View and manage patient records"
        data={filteredPatients}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, email, or phone..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Patient"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPatient ? 'Edit Patient' : 'Register New Patient'}</DialogTitle>
            <DialogDescription>
              {editingPatient ? 'Update patient details.' : 'Enter patient information.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v as Patient['gender'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
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
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingPatient ? 'Update' : 'Register'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Patient"
        description="Are you sure you want to delete this patient record?"
      />
    </div>
  );
}
