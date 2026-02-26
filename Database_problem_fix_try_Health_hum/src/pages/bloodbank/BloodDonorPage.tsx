import { useState } from 'react';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockBloodDonors } from '@/lib/bloodBankData';
import { BloodDonor, BloodGroup } from '@/types/bloodBank';
import { toast } from 'sonner';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodDonorPage() {
  const { data: donors, addItem, updateItem, deleteItem } = useLocalStorage<BloodDonor>('bloodDonors', mockBloodDonors);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<BloodDonor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', bloodGroup: '' as BloodGroup, dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other', address: '', eligibleToDonate: true,
    lastDonationDate: '', totalDonations: 0,
  });

  const filtered = donors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: Column<BloodDonor>[] = [
    { key: 'name', header: 'Name', render: (d) => <span className="font-medium">{d.name}</span> },
    { key: 'bloodGroup', header: 'Blood Group', render: (d) => <Badge variant="outline" className="font-bold">{d.bloodGroup}</Badge> },
    { key: 'phone', header: 'Phone' },
    { key: 'eligibleToDonate', header: 'Eligible', render: (d) => <Badge variant={d.eligibleToDonate ? 'default' : 'secondary'}>{d.eligibleToDonate ? 'Yes' : 'No'}</Badge> },
    { key: 'totalDonations', header: 'Donations', render: (d) => <span className="font-semibold">{d.totalDonations}</span> },
    { key: 'lastDonationDate', header: 'Last Donation', render: (d) => d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : 'N/A' },
    { key: 'nextEligibleDate', header: 'Next Eligible', render: (d) => d.nextEligibleDate ? new Date(d.nextEligibleDate).toLocaleDateString() : 'N/A' },
  ];

  const handleAdd = () => { setEditing(null); setFormData({ name: '', phone: '', email: '', bloodGroup: '' as BloodGroup, dateOfBirth: '', gender: '' as 'male', address: '', eligibleToDonate: true, lastDonationDate: '', totalDonations: 0 }); setIsFormOpen(true); };
  const handleEdit = (d: BloodDonor) => { setEditing(d); setFormData({ name: d.name, phone: d.phone, email: d.email, bloodGroup: d.bloodGroup, dateOfBirth: d.dateOfBirth, gender: d.gender, address: d.address, eligibleToDonate: d.eligibleToDonate, lastDonationDate: d.lastDonationDate || '', totalDonations: d.totalDonations }); setIsFormOpen(true); };
  const handleDelete = (d: BloodDonor) => { setDeleteId(d.id); setIsDeleteOpen(true); };
  const confirmDelete = () => { if (deleteId) { deleteItem(deleteId); toast.success('Donor deleted'); setIsDeleteOpen(false); } };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextEligible = formData.lastDonationDate ? new Date(new Date(formData.lastDonationDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined;
    if (editing) {
      updateItem(editing.id, { ...formData, nextEligibleDate: nextEligible });
      toast.success('Donor updated');
    } else {
      addItem({ id: `donor-${Date.now()}`, ...formData, nextEligibleDate: nextEligible, createdAt: new Date().toISOString().split('T')[0] });
      toast.success('Donor registered');
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable title="Donor Management" description="Manage blood donors" data={filtered} columns={columns} searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search donors..." onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} addButtonLabel="Register Donor" />
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Donor' : 'Register Donor'}</DialogTitle><DialogDescription>Enter donor details.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Full Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v as BloodGroup })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v as 'male' | 'female' | 'other' })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Last Donation Date</Label><Input type="date" value={formData.lastDonationDate} onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })} /></div>
                <div className="space-y-2"><Label>Total Donations</Label><Input type="number" value={formData.totalDonations} onChange={(e) => setFormData({ ...formData, totalDonations: parseInt(e.target.value) || 0 })} /></div>
              </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button type="submit">{editing ? 'Update' : 'Register'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Delete Donor" description="Are you sure you want to delete this donor record?" />
    </div>
  );
}
