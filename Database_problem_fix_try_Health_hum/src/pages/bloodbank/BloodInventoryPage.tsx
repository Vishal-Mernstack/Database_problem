import { useState } from 'react';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockBloodInventory } from '@/lib/bloodBankData';
import { BloodInventory, BloodGroup } from '@/types/bloodBank';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodInventoryPage() {
  const { data: inventory, addItem, updateItem, deleteItem } = useLocalStorage<BloodInventory>('bloodInventory', mockBloodInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<BloodInventory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ bloodGroup: '' as BloodGroup, units: 0, lowStockThreshold: 5 });

  const filtered = inventory.filter(i => i.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: Column<BloodInventory>[] = [
    { key: 'bloodGroup', header: 'Blood Group', render: (i) => {
      const isLow = i.units <= i.lowStockThreshold;
      return <Badge variant={isLow ? 'destructive' : 'outline'} className="text-sm font-bold">{i.bloodGroup}</Badge>;
    }},
    { key: 'units', header: 'Available Units', render: (i) => {
      const isLow = i.units <= i.lowStockThreshold;
      return <div className="flex items-center gap-2"><span className={isLow ? 'text-destructive font-bold' : 'font-semibold'}>{i.units}</span>{isLow && <AlertTriangle className="h-4 w-4 text-destructive" />}</div>;
    }},
    { key: 'lowStockThreshold', header: 'Low Stock Threshold' },
    { key: 'stock_level', header: 'Stock Level', render: (i) => {
      const pct = Math.min((i.units / (i.lowStockThreshold * 3)) * 100, 100);
      return <div className="w-32"><Progress value={pct} className="h-2" /></div>;
    }},
    { key: 'lastUpdated', header: 'Last Updated', render: (i) => new Date(i.lastUpdated).toLocaleDateString() },
  ];

  const handleAdd = () => { setEditing(null); setFormData({ bloodGroup: '' as BloodGroup, units: 0, lowStockThreshold: 5 }); setIsFormOpen(true); };
  const handleEdit = (item: BloodInventory) => { setEditing(item); setFormData({ bloodGroup: item.bloodGroup, units: item.units, lowStockThreshold: item.lowStockThreshold }); setIsFormOpen(true); };
  const handleDelete = (item: BloodInventory) => { setDeleteId(item.id); setIsDeleteOpen(true); };
  const confirmDelete = () => { if (deleteId) { deleteItem(deleteId); toast.success('Inventory item deleted'); setIsDeleteOpen(false); } };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateItem(editing.id, { ...formData, lastUpdated: new Date().toISOString().split('T')[0] });
      toast.success('Inventory updated');
    } else {
      addItem({ id: `bi-${Date.now()}`, ...formData, lastUpdated: new Date().toISOString().split('T')[0] });
      toast.success('Blood group added to inventory');
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable title="Blood Inventory" description="Manage blood group-wise stock" data={filtered} columns={columns} searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search blood group..." onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} addButtonLabel="Add Stock" />
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Update Stock' : 'Add Blood Stock'}</DialogTitle><DialogDescription>Enter blood inventory details.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Blood Group</Label>
                <Select value={formData.bloodGroup} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v as BloodGroup })}>
                  <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                  <SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Units Available</Label><Input type="number" value={formData.units} onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 0 })} required /></div>
              <div className="space-y-2"><Label>Low Stock Threshold</Label><Input type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })} required /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button type="submit">{editing ? 'Update' : 'Add'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Delete Inventory Item" description="Are you sure you want to delete this blood inventory record?" />
    </div>
  );
}
