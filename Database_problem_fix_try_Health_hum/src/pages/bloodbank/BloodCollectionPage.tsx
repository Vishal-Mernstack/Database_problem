import { useState } from 'react';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockBloodCollections, mockBloodDonors } from '@/lib/bloodBankData';
import { BloodCollection, BloodGroup } from '@/types/bloodBank';
import { getData } from '@/lib/mockData';
import { toast } from 'sonner';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodCollectionPage() {
  const { data: collections, addItem, updateItem, deleteItem } = useLocalStorage<BloodCollection>('bloodCollections', mockBloodCollections);
  const donors = getData('bloodDonors', mockBloodDonors);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<BloodCollection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    donorId: '', donorName: '', bloodGroup: '' as BloodGroup, collectionDate: '',
    quantity: 450, bagId: '', screeningStatus: 'pending' as BloodCollection['screeningStatus'], notes: '',
  });

  const filtered = collections.filter(c => c.donorName.toLowerCase().includes(searchQuery.toLowerCase()) || c.bagId.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: Column<BloodCollection>[] = [
    { key: 'bagId', header: 'Bag ID', render: (c) => <Badge variant="outline">{c.bagId}</Badge> },
    { key: 'donorName', header: 'Donor', render: (c) => <span className="font-medium">{c.donorName}</span> },
    { key: 'bloodGroup', header: 'Blood Group', render: (c) => <Badge variant="outline" className="font-bold">{c.bloodGroup}</Badge> },
    { key: 'collectionDate', header: 'Date', render: (c) => new Date(c.collectionDate).toLocaleDateString() },
    { key: 'quantity', header: 'Quantity (ml)' },
    { key: 'screeningStatus', header: 'Screening', render: (c) => <StatusBadge status={c.screeningStatus} /> },
  ];

  const handleAdd = () => { setEditing(null); setFormData({ donorId: '', donorName: '', bloodGroup: '' as BloodGroup, collectionDate: new Date().toISOString().split('T')[0], quantity: 450, bagId: `BAG-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`, screeningStatus: 'pending', notes: '' }); setIsFormOpen(true); };
  const handleEdit = (c: BloodCollection) => { setEditing(c); setFormData({ donorId: c.donorId, donorName: c.donorName, bloodGroup: c.bloodGroup, collectionDate: c.collectionDate, quantity: c.quantity, bagId: c.bagId, screeningStatus: c.screeningStatus, notes: c.notes || '' }); setIsFormOpen(true); };
  const handleDelete = (c: BloodCollection) => { setDeleteId(c.id); setIsDeleteOpen(true); };
  const confirmDelete = () => { if (deleteId) { deleteItem(deleteId); toast.success('Collection record deleted'); setIsDeleteOpen(false); } };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateItem(editing.id, formData);
      toast.success('Collection record updated');
    } else {
      addItem({ id: `bc-${Date.now()}`, ...formData });
      toast.success('Blood collection recorded');
    }
    setIsFormOpen(false);
  };

  const handleDonorChange = (donorId: string) => {
    const donor = donors.find(d => d.id === donorId);
    if (donor) {
      setFormData({ ...formData, donorId, donorName: donor.name, bloodGroup: donor.bloodGroup });
    }
  };

  return (
    <div className="space-y-6">
      <DataTable title="Blood Collection" description="Manage blood collection records" data={filtered} columns={columns} searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search by donor or bag ID..." onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} addButtonLabel="Record Collection" />
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Collection' : 'Record Blood Collection'}</DialogTitle><DialogDescription>Enter collection details.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Donor</Label>
                  <Select value={formData.donorId} onValueChange={handleDonorChange}>
                    <SelectTrigger><SelectValue placeholder="Select donor" /></SelectTrigger>
                    <SelectContent>{donors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.bloodGroup})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v as BloodGroup })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bag ID</Label><Input value={formData.bagId} onChange={(e) => setFormData({ ...formData, bagId: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Collection Date</Label><Input type="date" value={formData.collectionDate} onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Quantity (ml)</Label><Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} required /></div>
                <div className="space-y-2"><Label>Screening Status</Label>
                  <Select value={formData.screeningStatus} onValueChange={(v) => setFormData({ ...formData, screeningStatus: v as BloodCollection['screeningStatus'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="passed">Passed</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button type="submit">{editing ? 'Update' : 'Record'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Delete Collection Record" description="Are you sure you want to delete this collection record?" />
    </div>
  );
}
