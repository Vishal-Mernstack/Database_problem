import { useState } from 'react';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useDatabaseCollection } from '@/hooks/useDatabaseCollection';
import { mockBeds } from '@/lib/mockData';
import { Bed } from '@/types';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';

export function BedManagement() {
  const { data: beds, addItem, updateItem, deleteItem } = useDatabaseCollection<Bed>({
    collection: 'beds',
    initialData: mockBeds,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [deleteBedId, setDeleteBedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    wardId: '',
    wardName: '',
    bedNumber: '',
    status: 'available' as Bed['status'],
    patientName: '',
  });

  const filteredBeds = beds.filter(b =>
    b.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.wardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.patientName && b.patientName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns: Column<Bed>[] = [
    { key: 'bedNumber', header: 'Bed Number', render: (b) => <Badge variant="outline">{b.bedNumber}</Badge> },
    { key: 'wardName', header: 'Ward' },
    { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    { key: 'patientName', header: 'Patient', render: (b) => b.patientName || '-' },
  ];

  const handleAdd = () => {
    setEditingBed(null);
    setFormData({ wardId: '', wardName: '', bedNumber: '', status: 'available', patientName: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (bed: Bed) => {
    setEditingBed(bed);
    setFormData({
      wardId: bed.wardId,
      wardName: bed.wardName,
      bedNumber: bed.bedNumber,
      status: bed.status,
      patientName: bed.patientName || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (bed: Bed) => {
    setDeleteBedId(bed.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteBedId) {
      deleteItem(deleteBedId);
      toast.success('Bed deleted successfully');
      setIsDeleteOpen(false);
      setDeleteBedId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBed) {
      updateItem(editingBed.id, formData);
      toast.success('Bed updated successfully');
    } else {
      const newBed: Bed = {
        id: `bed-${Date.now()}`,
        ...formData,
      };
      addItem(newBed);
      toast.success('Bed created successfully');
    }
    setIsFormOpen(false);
  };

  const wardOptions = [
    { value: 'General Ward A', label: 'General Ward A' },
    { value: 'ICU', label: 'ICU' },
    { value: 'Pediatric Ward', label: 'Pediatric Ward' },
    { value: 'Emergency', label: 'Emergency' },
    { value: 'Private Room', label: 'Private Room' },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Bed Management"
        description="Manage hospital beds and ward allocation"
        data={filteredBeds}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by bed number, ward, or patient..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Bed"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBed ? 'Edit Bed' : 'Add New Bed'}</DialogTitle>
            <DialogDescription>
              {editingBed ? 'Update bed details.' : 'Add a new bed to the hospital.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedNumber">Bed Number</Label>
                  <Input
                    id="bedNumber"
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                    placeholder="e.g., A-101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wardName">Ward</Label>
                  <Select value={formData.wardName} onValueChange={(v) => setFormData({ ...formData, wardName: v, wardId: `ward-${v.toLowerCase().replace(/\s+/g, '-')}` })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wardOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Bed['status'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.status === 'occupied' && (
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input
                      id="patientName"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingBed ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Bed"
        description="Are you sure you want to delete this bed?"
      />
    </div>
  );
}
