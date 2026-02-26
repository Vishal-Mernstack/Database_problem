import { useState } from 'react';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockAppointments, mockPatients, mockUsers } from '@/lib/mockData';
import { Appointment, Patient, User } from '@/types';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';

export function DoctorAppointments() {
  const { data: appointments, addItem, updateItem, deleteItem } = useLocalStorage<Appointment>('appointments', mockAppointments);
  const patients = mockPatients;
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [deleteAptId, setDeleteAptId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: '',
    time: '',
    type: 'opd' as Appointment['type'],
    status: 'scheduled' as Appointment['status'],
    notes: '',
  });

  const filteredAppointments = appointments.filter(a =>
    a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Appointment>[] = [
    { key: 'tokenNumber', header: 'Token', render: (a) => <Badge variant="outline">#{a.tokenNumber}</Badge> },
    { key: 'patientName', header: 'Patient', render: (a) => <span className="font-medium">{a.patientName}</span> },
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time' },
    { key: 'type', header: 'Type', render: (a) => <Badge variant="secondary" className="capitalize">{a.type}</Badge> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  ];

  const handleAdd = () => {
    setEditingApt(null);
    setFormData({ patientId: '', patientName: '', date: '', time: '', type: 'opd', status: 'scheduled', notes: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (apt: Appointment) => {
    setEditingApt(apt);
    setFormData({
      patientId: apt.patientId,
      patientName: apt.patientName,
      date: apt.date,
      time: apt.time,
      type: apt.type,
      status: apt.status,
      notes: apt.notes || '',
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
      toast.success('Appointment deleted successfully');
      setIsDeleteOpen(false);
      setDeleteAptId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    if (editingApt) {
      updateItem(editingApt.id, { ...formData, patientName: patient?.name || formData.patientName });
      toast.success('Appointment updated successfully');
    } else {
      const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        ...formData,
        patientName: patient?.name || '',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Michael Chen',
        department: 'Cardiology',
        tokenNumber: appointments.length + 1,
      };
      addItem(newApt);
      toast.success('Appointment created successfully');
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Appointments"
        description="Manage your appointments"
        data={filteredAppointments}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by patient or doctor..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="New Appointment"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingApt ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
            <DialogDescription>
              {editingApt ? 'Update appointment details.' : 'Schedule a new appointment.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select value={formData.patientId} onValueChange={(v) => setFormData({ ...formData, patientId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Appointment['type'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opd">OPD</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Appointment['status'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingApt ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment?"
      />
    </div>
  );
}
