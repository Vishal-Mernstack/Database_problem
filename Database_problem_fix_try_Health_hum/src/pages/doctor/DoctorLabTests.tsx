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
import { mockLabTests, mockPatients } from '@/lib/mockData';
import { LabTest } from '@/types';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';

export function DoctorLabTests() {
  const { data: labTests, addItem, updateItem, deleteItem } = useLocalStorage<LabTest>('labTests', mockLabTests);
  const patients = mockPatients;
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    testName: '',
    testType: '',
    status: 'requested' as LabTest['status'],
    notes: '',
  });

  const filteredTests = labTests.filter(t =>
    t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.testName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<LabTest>[] = [
    { key: 'id', header: 'Test ID', render: (t) => <Badge variant="outline">{t.id.toUpperCase()}</Badge> },
    { key: 'patientName', header: 'Patient', render: (t) => <span className="font-medium">{t.patientName}</span> },
    { key: 'testName', header: 'Test Name' },
    { key: 'testType', header: 'Type', render: (t) => <Badge variant="secondary">{t.testType}</Badge> },
    { key: 'requestDate', header: 'Date', render: (t) => new Date(t.requestDate).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  ];

  const handleAdd = () => {
    setEditingTest(null);
    setFormData({ patientId: '', testName: '', testType: '', status: 'requested', notes: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (test: LabTest) => {
    setEditingTest(test);
    setFormData({
      patientId: test.patientId,
      testName: test.testName,
      testType: test.testType,
      status: test.status,
      notes: test.notes || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (test: LabTest) => {
    setDeleteTestId(test.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTestId) {
      deleteItem(deleteTestId);
      toast.success('Lab test deleted successfully');
      setIsDeleteOpen(false);
      setDeleteTestId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    if (editingTest) {
      updateItem(editingTest.id, formData);
      toast.success('Lab test updated successfully');
    } else {
      const newTest: LabTest = {
        id: `lab-${Date.now()}`,
        patientId: formData.patientId,
        patientName: patient?.name || '',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Michael Chen',
        testName: formData.testName,
        testType: formData.testType,
        status: 'requested',
        requestDate: new Date().toISOString().split('T')[0],
        cost: 100,
      };
      addItem(newTest);
      toast.success('Lab test requested successfully');
    }
    setIsFormOpen(false);
  };

  const testTypes = ['Hematology', 'Biochemistry', 'Radiology', 'Microbiology', 'Immunology'];

  return (
    <div className="space-y-6">
      <DataTable
        title="Lab Tests"
        description="Request and manage lab tests"
        data={filteredTests}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by patient or test name..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Request Test"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTest ? 'Edit Lab Test' : 'Request Lab Test'}</DialogTitle>
            <DialogDescription>
              {editingTest ? 'Update lab test details.' : 'Request a new lab test for a patient.'}
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
              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input
                  value={formData.testName}
                  onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                  placeholder="e.g., Complete Blood Count"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Test Type</Label>
                <Select value={formData.testType} onValueChange={(v) => setFormData({ ...formData, testType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingTest && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as LabTest['status'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requested">Requested</SelectItem>
                      <SelectItem value="sample-collected">Sample Collected</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes for the lab..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingTest ? 'Update' : 'Request'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Lab Test"
        description="Are you sure you want to delete this lab test request?"
      />
    </div>
  );
}
