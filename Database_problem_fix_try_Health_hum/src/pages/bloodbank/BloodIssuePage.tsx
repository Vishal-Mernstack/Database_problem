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
import { Checkbox } from '@/components/ui/checkbox';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockBloodIssues } from '@/lib/bloodBankData';
import { BloodIssue, BloodGroup } from '@/types/bloodBank';
import { getData, mockPatients } from '@/lib/mockData';
import { toast } from 'sonner';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Basic compatibility check
const isCompatible = (donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean => {
  const compatibility: Record<BloodGroup, BloodGroup[]> = {
    'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'O+': ['A+', 'B+', 'AB+', 'O+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'A+': ['A+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB+', 'AB-'],
    'AB+': ['AB+'],
  };
  return compatibility[donorGroup]?.includes(recipientGroup) || false;
};

export default function BloodIssuePage() {
  const { data: issues, addItem, updateItem, deleteItem } = useLocalStorage<BloodIssue>('bloodIssues', mockBloodIssues);
  const patients = getData('patients', mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<BloodIssue | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bagId: '', bloodGroup: '' as BloodGroup, patientId: '', patientName: '', patientBloodGroup: '' as BloodGroup,
    issuedDate: '', issuedBy: '', purpose: 'transfusion' as BloodIssue['purpose'],
    isEmergency: false, crossMatchResult: 'compatible' as BloodIssue['crossMatchResult'], notes: '',
  });

  const filtered = issues.filter(i => i.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || i.bagId.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: Column<BloodIssue>[] = [
    { key: 'bagId', header: 'Bag ID', render: (i) => <Badge variant="outline">{i.bagId}</Badge> },
    { key: 'bloodGroup', header: 'Group', render: (i) => <Badge variant="outline" className="font-bold">{i.bloodGroup}</Badge> },
    { key: 'patientName', header: 'Patient', render: (i) => <span className="font-medium">{i.patientName}</span> },
    { key: 'patientBloodGroup', header: 'Patient Group', render: (i) => <Badge variant="outline">{i.patientBloodGroup}</Badge> },
    { key: 'purpose', header: 'Purpose', render: (i) => <Badge variant={i.isEmergency ? 'destructive' : 'secondary'} className="capitalize">{i.purpose}</Badge> },
    { key: 'crossMatchResult', header: 'Cross-Match', render: (i) => <Badge variant={i.crossMatchResult === 'compatible' ? 'default' : 'destructive'}>{i.crossMatchResult}</Badge> },
    { key: 'issuedDate', header: 'Issued', render: (i) => new Date(i.issuedDate).toLocaleDateString() },
  ];

  const handleAdd = () => { setEditing(null); setFormData({ bagId: '', bloodGroup: '' as BloodGroup, patientId: '', patientName: '', patientBloodGroup: '' as BloodGroup, issuedDate: new Date().toISOString().split('T')[0], issuedBy: '', purpose: 'transfusion', isEmergency: false, crossMatchResult: 'compatible', notes: '' }); setIsFormOpen(true); };
  const handleEdit = (i: BloodIssue) => { setEditing(i); setFormData({ bagId: i.bagId, bloodGroup: i.bloodGroup, patientId: i.patientId, patientName: i.patientName, patientBloodGroup: i.patientBloodGroup, issuedDate: i.issuedDate, issuedBy: i.issuedBy, purpose: i.purpose, isEmergency: i.isEmergency, crossMatchResult: i.crossMatchResult, notes: i.notes || '' }); setIsFormOpen(true); };
  const handleDelete = (i: BloodIssue) => { setDeleteId(i.id); setIsDeleteOpen(true); };
  const confirmDelete = () => { if (deleteId) { deleteItem(deleteId); toast.success('Issue record deleted'); setIsDeleteOpen(false); } };

  const handleBloodGroupChange = (group: BloodGroup) => {
    const compat = formData.patientBloodGroup ? isCompatible(group, formData.patientBloodGroup) : true;
    setFormData({ ...formData, bloodGroup: group, crossMatchResult: compat ? 'compatible' : 'incompatible' });
  };

  const handlePatientGroupChange = (group: BloodGroup) => {
    const compat = formData.bloodGroup ? isCompatible(formData.bloodGroup, group) : true;
    setFormData({ ...formData, patientBloodGroup: group, crossMatchResult: compat ? 'compatible' : 'incompatible' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.crossMatchResult === 'incompatible' && !formData.isEmergency) {
      toast.error('Cannot issue incompatible blood for non-emergency cases');
      return;
    }
    if (editing) { updateItem(editing.id, formData); toast.success('Issue record updated'); }
    else { addItem({ id: `issue-${Date.now()}`, ...formData }); toast.success('Blood issued successfully'); }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable title="Blood Issue & Transfusion" description="Manage blood issuing and transfusion records" data={filtered} columns={columns} searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search by patient or bag ID..." onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} addButtonLabel="Issue Blood" />
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Issue Record' : 'Issue Blood'}</DialogTitle><DialogDescription>Enter blood issue details.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bag ID</Label><Input value={formData.bagId} onChange={(e) => setFormData({ ...formData, bagId: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Donor Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={handleBloodGroupChange}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Patient Name</Label><Input value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Patient Blood Group</Label>
                  <Select value={formData.patientBloodGroup} onValueChange={handlePatientGroupChange}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              {formData.crossMatchResult === 'incompatible' && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive font-medium">⚠️ Blood groups are incompatible! Only allowed for emergency cases.</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Purpose</Label>
                  <Select value={formData.purpose} onValueChange={(v) => setFormData({ ...formData, purpose: v as BloodIssue['purpose'] })}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="transfusion">Transfusion</SelectItem><SelectItem value="surgery">Surgery</SelectItem><SelectItem value="emergency">Emergency</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Issued By</Label><Input value={formData.issuedBy} onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })} required /></div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="emergency" checked={formData.isEmergency} onCheckedChange={(checked) => setFormData({ ...formData, isEmergency: checked as boolean })} />
                <Label htmlFor="emergency" className="text-destructive font-medium">Emergency Issue</Label>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button type="submit">{editing ? 'Update' : 'Issue Blood'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Delete Issue Record" description="Are you sure you want to delete this blood issue record?" />
    </div>
  );
}
