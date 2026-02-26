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
import { mockBloodRequests } from '@/lib/bloodBankData';
import { BloodRequest, BloodGroup } from '@/types/bloodBank';
import { toast } from 'sonner';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodRequestPage() {
  const { data: requests, addItem, updateItem, deleteItem } = useLocalStorage<BloodRequest>('bloodRequests', mockBloodRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<BloodRequest | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    requestedBy: '', requestedByRole: '', patientId: '', patientName: '',
    bloodGroup: '' as BloodGroup, units: 1, priority: 'normal' as BloodRequest['priority'],
    requestDate: '', status: 'pending' as BloodRequest['status'], notes: '',
  });

  const filtered = requests.filter(r => r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || r.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: Column<BloodRequest>[] = [
    { key: 'id', header: 'Request ID', render: (r) => <Badge variant="outline">{r.id.toUpperCase()}</Badge> },
    { key: 'patientName', header: 'Patient', render: (r) => <span className="font-medium">{r.patientName}</span> },
    { key: 'bloodGroup', header: 'Group', render: (r) => <Badge variant="outline" className="font-bold">{r.bloodGroup}</Badge> },
    { key: 'units', header: 'Units' },
    { key: 'priority', header: 'Priority', render: (r) => <Badge variant={r.priority === 'emergency' ? 'destructive' : r.priority === 'urgent' ? 'default' : 'secondary'}>{r.priority}</Badge> },
    { key: 'requestedBy', header: 'Requested By', render: (r) => <div><p className="text-sm">{r.requestedBy}</p><p className="text-xs text-muted-foreground">{r.requestedByRole}</p></div> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'fulfilled' ? 'default' : r.status === 'approved' ? 'secondary' : r.status === 'rejected' ? 'destructive' : 'outline'}>{r.status}</Badge> },
  ];

  const handleAdd = () => { setEditing(null); setFormData({ requestedBy: '', requestedByRole: '', patientId: '', patientName: '', bloodGroup: '' as BloodGroup, units: 1, priority: 'normal', requestDate: new Date().toISOString().split('T')[0], status: 'pending', notes: '' }); setIsFormOpen(true); };
  const handleEdit = (r: BloodRequest) => { setEditing(r); setFormData({ requestedBy: r.requestedBy, requestedByRole: r.requestedByRole, patientId: r.patientId, patientName: r.patientName, bloodGroup: r.bloodGroup, units: r.units, priority: r.priority, requestDate: r.requestDate, status: r.status, notes: r.notes || '' }); setIsFormOpen(true); };
  const handleDelete = (r: BloodRequest) => { setDeleteId(r.id); setIsDeleteOpen(true); };
  const confirmDelete = () => { if (deleteId) { deleteItem(deleteId); toast.success('Request deleted'); setIsDeleteOpen(false); } };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const approvalData = formData.status === 'approved' ? { approvedBy: 'Blood Bank Admin', approvedDate: new Date().toISOString().split('T')[0] } : {};
    if (editing) { updateItem(editing.id, { ...formData, ...approvalData }); toast.success('Request updated'); }
    else { addItem({ id: `req-${Date.now()}`, ...formData, ...approvalData }); toast.success('Blood request created'); }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable title="Blood Requests & Approvals" description="Manage blood requests from doctors and wards" data={filtered} columns={columns} searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search requests..." onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} addButtonLabel="New Request" />
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editing ? 'Update Request' : 'New Blood Request'}</DialogTitle><DialogDescription>Enter blood request details.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Patient Name</Label><Input value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v as BloodGroup })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Requested By</Label><Input value={formData.requestedBy} onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Role</Label>
                  <Select value={formData.requestedByRole} onValueChange={(v) => setFormData({ ...formData, requestedByRole: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Doctor">Doctor</SelectItem><SelectItem value="Nurse">Nurse</SelectItem><SelectItem value="Surgeon">Surgeon</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Units</Label><Input type="number" min={1} value={formData.units} onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })} required /></div>
                <div className="space-y-2"><Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as BloodRequest['priority'] })}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="emergency">Emergency</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as BloodRequest['status'] })}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="fulfilled">Fulfilled</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button type="submit">{editing ? 'Update' : 'Submit Request'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Delete Request" description="Are you sure you want to delete this blood request?" />
    </div>
  );
}
