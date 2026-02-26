import { useState } from 'react';
import { DataTable, Column } from '@/components/crud/DataTable';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockBloodTests } from '@/lib/bloodBankData';
import { BloodTest } from '@/types/bloodBank';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const TestResultBadge = ({ result }: { result: string }) => {
  if (result === 'negative') return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Negative</Badge>;
  if (result === 'positive') return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Positive</Badge>;
  return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
};

export default function BloodTestingPage() {
  const { data: tests, addItem, updateItem } = useLocalStorage<BloodTest>('bloodTests', mockBloodTests);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<BloodTest | null>(null);
  const [formData, setFormData] = useState({
    bagId: '', donorName: '', bloodGroup: '' as any, testDate: '',
    hivTest: 'pending' as any, hepatitisB: 'pending' as any, hepatitisC: 'pending' as any,
    syphilis: 'pending' as any, malaria: 'pending' as any,
    overallStatus: 'pending' as any, verifiedBy: '', notes: '',
  });

  const filtered = tests.filter(t => t.donorName.toLowerCase().includes(searchQuery.toLowerCase()) || t.bagId.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: Column<BloodTest>[] = [
    { key: 'bagId', header: 'Bag ID', render: (t) => <Badge variant="outline">{t.bagId}</Badge> },
    { key: 'donorName', header: 'Donor', render: (t) => <span className="font-medium">{t.donorName}</span> },
    { key: 'bloodGroup', header: 'Group', render: (t) => <Badge variant="outline" className="font-bold">{t.bloodGroup}</Badge> },
    { key: 'hivTest', header: 'HIV', render: (t) => <TestResultBadge result={t.hivTest} /> },
    { key: 'hepatitisB', header: 'Hep-B', render: (t) => <TestResultBadge result={t.hepatitisB} /> },
    { key: 'hepatitisC', header: 'Hep-C', render: (t) => <TestResultBadge result={t.hepatitisC} /> },
    { key: 'overallStatus', header: 'Overall', render: (t) => <Badge variant={t.overallStatus === 'approved' ? 'default' : t.overallStatus === 'rejected' ? 'destructive' : 'secondary'}>{t.overallStatus}</Badge> },
  ];

  const handleEdit = (t: BloodTest) => {
    setEditing(t);
    setFormData({ bagId: t.bagId, donorName: t.donorName, bloodGroup: t.bloodGroup, testDate: t.testDate, hivTest: t.hivTest, hepatitisB: t.hepatitisB, hepatitisC: t.hepatitisC, syphilis: t.syphilis, malaria: t.malaria, overallStatus: t.overallStatus, verifiedBy: t.verifiedBy || '', notes: t.notes || '' });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasPositive = [formData.hivTest, formData.hepatitisB, formData.hepatitisC, formData.syphilis, formData.malaria].includes('positive');
    const allTested = ![formData.hivTest, formData.hepatitisB, formData.hepatitisC, formData.syphilis, formData.malaria].includes('pending');
    const autoStatus = hasPositive ? 'rejected' : (allTested ? 'approved' : 'pending');

    if (editing) {
      updateItem(editing.id, { ...formData, overallStatus: autoStatus });
      toast.success('Test results updated');
    } else {
      addItem({ id: `bt-${Date.now()}`, ...formData, overallStatus: autoStatus });
      toast.success('Test record created');
    }
    setIsFormOpen(false);
  };

  const resultOptions = ['pending', 'negative', 'positive'];

  return (
    <div className="space-y-6">
      <DataTable title="Blood Testing & Screening" description="Manage blood safety test results" data={filtered} columns={columns} searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search by donor or bag ID..." onEdit={handleEdit} />
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Update Test Results</DialogTitle><DialogDescription>Enter screening test results for {editing?.bagId}.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bag ID</Label><Input value={formData.bagId} disabled /></div>
                <div className="space-y-2"><Label>Test Date</Label><Input type="date" value={formData.testDate} onChange={(e) => setFormData({ ...formData, testDate: e.target.value })} required /></div>
              </div>
              {(['hivTest', 'hepatitisB', 'hepatitisC', 'syphilis', 'malaria'] as const).map((test) => (
                <div key={test} className="grid grid-cols-2 gap-4 items-center">
                  <Label className="capitalize">{test === 'hivTest' ? 'HIV' : test === 'hepatitisB' ? 'Hepatitis B' : test === 'hepatitisC' ? 'Hepatitis C' : test === 'syphilis' ? 'Syphilis' : 'Malaria'}</Label>
                  <Select value={formData[test]} onValueChange={(v) => setFormData({ ...formData, [test]: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{resultOptions.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
              <div className="space-y-2"><Label>Verified By</Label><Input value={formData.verifiedBy} onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })} /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button type="submit">Save Results</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
