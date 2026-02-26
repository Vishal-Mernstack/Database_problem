import { useState } from 'react';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockBloodStorage } from '@/lib/bloodBankData';
import { BloodStorage, BloodGroup } from '@/types/bloodBank';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodStoragePage() {
  const { data: storage, addItem, updateItem, deleteItem } = useLocalStorage<BloodStorage>('bloodStorage', mockBloodStorage);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<BloodStorage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bagId: '', bloodGroup: '' as BloodGroup, storageLocation: '' as BloodStorage['storageLocation'],
    storedDate: '', expiryDate: '', status: 'stored' as BloodStorage['status'],
    disposalDate: '', disposalReason: '',
  });

  const filtered = storage.filter(s => s.bagId.toLowerCase().includes(searchQuery.toLowerCase()) || s.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()));

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);
    return expiry <= sevenDays && expiry >= new Date();
  };

  const columns: Column<BloodStorage>[] = [
    { key: 'bagId', header: 'Bag ID', render: (s) => <Badge variant="outline">{s.bagId}</Badge> },
    { key: 'bloodGroup', header: 'Group', render: (s) => <Badge variant="outline" className="font-bold">{s.bloodGroup}</Badge> },
    { key: 'storageLocation', header: 'Location', render: (s) => <span className="capitalize">{s.storageLocation.replace('-', ' ')}</span> },
    { key: 'storedDate', header: 'Stored', render: (s) => new Date(s.storedDate).toLocaleDateString() },
    { key: 'expiryDate', header: 'Expiry', render: (s) => {
      const expiring = isExpiringSoon(s.expiryDate);
      const expired = new Date(s.expiryDate) < new Date();
      return <div className="flex items-center gap-1"><span className={expired ? 'text-destructive font-bold' : expiring ? 'text-amber-600 font-medium' : ''}>{new Date(s.expiryDate).toLocaleDateString()}</span>{(expired || expiring) && <AlertTriangle className="h-3 w-3 text-destructive" />}</div>;
    }},
    { key: 'status', header: 'Status', render: (s) => <Badge variant={s.status === 'stored' ? 'default' : s.status === 'expired' ? 'destructive' : s.status === 'issued' ? 'secondary' : 'outline'}>{s.status}</Badge> },
  ];

  const handleAdd = () => { setEditing(null); setFormData({ bagId: '', bloodGroup: '' as BloodGroup, storageLocation: '' as any, storedDate: new Date().toISOString().split('T')[0], expiryDate: '', status: 'stored', disposalDate: '', disposalReason: '' }); setIsFormOpen(true); };
  const handleEdit = (s: BloodStorage) => { setEditing(s); setFormData({ bagId: s.bagId, bloodGroup: s.bloodGroup, storageLocation: s.storageLocation, storedDate: s.storedDate, expiryDate: s.expiryDate, status: s.status, disposalDate: s.disposalDate || '', disposalReason: s.disposalReason || '' }); setIsFormOpen(true); };
  const handleDelete = (s: BloodStorage) => { setDeleteId(s.id); setIsDeleteOpen(true); };
  const confirmDelete = () => { if (deleteId) { deleteItem(deleteId); toast.success('Storage record deleted'); setIsDeleteOpen(false); } };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { updateItem(editing.id, formData); toast.success('Storage record updated'); }
    else { addItem({ id: `bs-${Date.now()}`, ...formData }); toast.success('Blood bag stored'); }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable title="Blood Storage & Expiry Tracking" description="Manage blood storage and monitor expiry dates" data={filtered} columns={columns} searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search by bag ID or group..." onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} addButtonLabel="Add to Storage" />
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Storage Record' : 'Store Blood Bag'}</DialogTitle><DialogDescription>Enter storage details.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bag ID</Label><Input value={formData.bagId} onChange={(e) => setFormData({ ...formData, bagId: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v as BloodGroup })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Storage Location</Label>
                  <Select value={formData.storageLocation} onValueChange={(v) => setFormData({ ...formData, storageLocation: v as BloodStorage['storageLocation'] })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="refrigerator">Refrigerator</SelectItem><SelectItem value="freezer">Freezer</SelectItem><SelectItem value="platelet-agitator">Platelet Agitator</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as BloodStorage['status'] })}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="stored">Stored</SelectItem><SelectItem value="expired">Expired</SelectItem><SelectItem value="issued">Issued</SelectItem><SelectItem value="disposed">Disposed</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Stored Date</Label><Input type="date" value={formData.storedDate} onChange={(e) => setFormData({ ...formData, storedDate: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} required /></div>
              </div>
              {(formData.status === 'disposed' || formData.status === 'expired') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Disposal Date</Label><Input type="date" value={formData.disposalDate} onChange={(e) => setFormData({ ...formData, disposalDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Disposal Reason</Label><Textarea value={formData.disposalReason} onChange={(e) => setFormData({ ...formData, disposalReason: e.target.value })} /></div>
                </div>
              )}
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button type="submit">{editing ? 'Update' : 'Store'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Delete Storage Record" description="Are you sure you want to delete this storage record?" />
    </div>
  );
}
