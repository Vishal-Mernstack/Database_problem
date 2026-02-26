import { useState } from 'react';
import { PharmacyDispense } from './PharmacyDispense';
import { PharmacyExpiring } from './PharmacyExpiring';
import { PharmacyPurchases } from './PharmacyPurchases';
import { PharmacyReports } from './PharmacyReports';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getData, mockMedicines } from '@/lib/mockData';
import { Medicine } from '@/types';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Pill,
  Package,
  AlertTriangle,
  FileText,
  Truck,
  DollarSign,
  Search,
  ShoppingCart,
  Calendar,
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/pharmacy', icon: LayoutDashboard },
  { title: 'Dispense', href: '/pharmacy/dispense', icon: ShoppingCart },
  { title: 'Inventory', href: '/pharmacy/inventory', icon: Package },
  { title: 'Low Stock', href: '/pharmacy/low-stock', icon: AlertTriangle },
  { title: 'Expiring Soon', href: '/pharmacy/expiring', icon: Calendar },
  { title: 'Purchases', href: '/pharmacy/purchases', icon: Truck },
  { title: 'Reports', href: '/pharmacy/reports', icon: FileText },
];

function PharmacyOverview() {
  const navigate = useNavigate();
  const medicines = getData('medicines', mockMedicines);
  
  const totalMedicines = medicines.length;
  const lowStockItems = medicines.filter(m => m.quantity <= m.reorderLevel).length;
  const expiringItems = medicines.filter(m => {
    const expiry = new Date(m.expiryDate);
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    return expiry <= threeMonths;
  }).length;
  const totalValue = medicines.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Medicines" value={totalMedicines} description="In inventory" icon={Pill} />
        <StatsCard title="Low Stock Items" value={lowStockItems} description="Need reorder" icon={AlertTriangle} />
        <StatsCard title="Expiring Soon" value={expiringItems} description="Within 3 months" icon={Calendar} />
        <StatsCard title="Inventory Value" value={`₹${totalValue.toLocaleString()}`} description="Total stock value" icon={DollarSign} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search medicines..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/pharmacy/dispense')}><ShoppingCart className="h-4 w-4 mr-2" />Dispense</Button>
          <Button variant="outline" onClick={() => navigate('/pharmacy/inventory')}><Package className="h-4 w-4 mr-2" />Add Stock</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Medicine Inventory</CardTitle>
            <CardDescription>Current stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((med) => {
                  const isLowStock = med.quantity <= med.reorderLevel;
                  const stockPercent = (med.quantity / (med.reorderLevel * 5)) * 100;
                  return (
                    <TableRow key={med.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.genericName}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{med.category}</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className={isLowStock ? 'text-destructive font-medium' : ''}>{med.quantity}</span>
                          {isLowStock && <AlertTriangle className="h-3 w-3 text-destructive inline ml-1" />}
                          <Progress value={Math.min(stockPercent, 100)} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(med.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => navigate('/pharmacy/dispense')}>Issue</Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {medicines.filter(m => m.quantity <= m.reorderLevel).map((med) => (
                <div key={med.id} className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm font-medium">{med.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Only {med.quantity} units left</p>
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => navigate('/pharmacy/low-stock')}>Reorder</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Today's Dispensing</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Prescriptions Filled</span><span className="font-semibold">24</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Medicines Issued</span><span className="font-semibold">87</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Sales</span><span className="font-semibold">₹12,450.00</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InventoryManagement() {
  const { data: medicines, addItem, updateItem, deleteItem } = useLocalStorage<Medicine>('medicines', mockMedicines);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [deleteMedId, setDeleteMedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    quantity: 0,
    unitPrice: 0,
    reorderLevel: 0,
  });

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Medicine>[] = [
    { key: 'name', header: 'Medicine', render: (m) => <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.genericName}</p></div> },
    { key: 'category', header: 'Category', render: (m) => <Badge variant="outline">{m.category}</Badge> },
    { key: 'batchNumber', header: 'Batch' },
    { key: 'quantity', header: 'Stock', render: (m) => <span className={m.quantity <= m.reorderLevel ? 'text-destructive font-medium' : ''}>{m.quantity}</span> },
    { key: 'unitPrice', header: 'Price', render: (m) => `₹${m.unitPrice.toFixed(2)}` },
    { key: 'expiryDate', header: 'Expiry', render: (m) => new Date(m.expiryDate).toLocaleDateString() },
  ];

  const handleAdd = () => {
    setEditingMed(null);
    setFormData({ name: '', genericName: '', category: '', manufacturer: '', batchNumber: '', expiryDate: '', quantity: 0, unitPrice: 0, reorderLevel: 50 });
    setIsFormOpen(true);
  };

  const handleEdit = (med: Medicine) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      genericName: med.genericName,
      category: med.category,
      manufacturer: med.manufacturer,
      batchNumber: med.batchNumber,
      expiryDate: med.expiryDate,
      quantity: med.quantity,
      unitPrice: med.unitPrice,
      reorderLevel: med.reorderLevel,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (med: Medicine) => {
    setDeleteMedId(med.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteMedId) {
      deleteItem(deleteMedId);
      toast.success('Medicine deleted');
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMed) {
      updateItem(editingMed.id, formData);
      toast.success('Medicine updated');
    } else {
      const newMed: Medicine = { id: `med-${Date.now()}`, ...formData };
      addItem(newMed);
      toast.success('Medicine added');
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Inventory Management"
        description="Manage medicine inventory"
        data={filteredMedicines}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search medicines..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Medicine"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingMed ? 'Edit Medicine' : 'Add Medicine'}</DialogTitle>
            <DialogDescription>Enter medicine details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Generic Name</Label>
                  <Input value={formData.genericName} onChange={(e) => setFormData({ ...formData, genericName: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {['Antibiotics', 'Cardiovascular', 'Diabetes', 'Pain Relief', 'Vitamins'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Manufacturer</Label>
                  <Input value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Batch Number</Label>
                  <Input value={formData.batchNumber} onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price (₹)</Label>
                  <Input type="number" step="0.01" value={formData.unitPrice} onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Level</Label>
                  <Input type="number" value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })} required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingMed ? 'Update' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Delete Medicine" description="Are you sure you want to delete this medicine?" />
    </div>
  );
}

function LowStock() {
  const navigate = useNavigate();
  const medicines = getData('medicines', mockMedicines);
  const lowStockMedicines = medicines.filter(m => m.quantity <= m.reorderLevel);
  const { addItem } = useLocalStorage<any>('purchaseOrders', []);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [reorderQuantity, setReorderQuantity] = useState(100);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  const suppliers = ['MediSupply Inc.', 'PharmaDist Co.', 'GlobalMeds Ltd.', 'HealthCare Supplies', 'MedWholesale Corp.'];

  const handleReorder = (med: Medicine) => {
    setSelectedMedicine(med);
    setReorderQuantity(med.reorderLevel * 2); // Default to 2x reorder level
    setIsReorderOpen(true);
  };

  const confirmReorder = () => {
    if (!selectedMedicine || !selectedSupplier) {
      toast.error('Please select a supplier');
      return;
    }

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 7);

    const newOrder = {
      id: `PO-${Date.now().toString().slice(-6)}`,
      supplier: selectedSupplier,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: expectedDelivery.toISOString().split('T')[0],
      items: [{
        medicineName: selectedMedicine.name,
        quantity: reorderQuantity,
        unitCost: selectedMedicine.unitPrice * 0.7, // Wholesale price
        total: reorderQuantity * selectedMedicine.unitPrice * 0.7,
      }],
      subtotal: reorderQuantity * selectedMedicine.unitPrice * 0.7,
      tax: reorderQuantity * selectedMedicine.unitPrice * 0.7 * 0.1,
      total: reorderQuantity * selectedMedicine.unitPrice * 0.7 * 1.1,
      status: 'pending',
      notes: `Reorder for low stock item: ${selectedMedicine.name}`,
    };

    addItem(newOrder);
    toast.success(`Purchase order created for ${selectedMedicine.name}`);
    setIsReorderOpen(false);
    setSelectedMedicine(null);
    setSelectedSupplier('');
  };

  const handleReorderAll = () => {
    if (lowStockMedicines.length === 0) return;
    
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 7);

    const items = lowStockMedicines.map(med => ({
      medicineName: med.name,
      quantity: med.reorderLevel * 2,
      unitCost: med.unitPrice * 0.7,
      total: med.reorderLevel * 2 * med.unitPrice * 0.7,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    const newOrder = {
      id: `PO-${Date.now().toString().slice(-6)}`,
      supplier: 'MediSupply Inc.',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: expectedDelivery.toISOString().split('T')[0],
      items,
      subtotal,
      tax: subtotal * 0.1,
      total: subtotal * 1.1,
      status: 'pending',
      notes: 'Bulk reorder for all low stock items',
    };

    addItem(newOrder);
    toast.success(`Purchase order created for ${lowStockMedicines.length} items`);
    navigate('/pharmacy/purchases');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Low Stock Alerts</h2>
          <p className="text-muted-foreground">Medicines that need to be reordered</p>
        </div>
        {lowStockMedicines.length > 0 && (
          <Button onClick={handleReorderAll}>
            <Truck className="h-4 w-4 mr-2" />
            Reorder All ({lowStockMedicines.length})
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lowStockMedicines.map((med) => (
          <Card key={med.id} className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg">{med.name}</CardTitle>
              <CardDescription>{med.genericName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Current Stock</span><span className="font-semibold text-destructive">{med.quantity}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Reorder Level</span><span className="font-semibold">{med.reorderLevel}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Unit Price</span><span className="font-semibold">${med.unitPrice.toFixed(2)}</span></div>
                <Button className="w-full mt-4" size="sm" onClick={() => handleReorder(med)}>
                  <Truck className="h-4 w-4 mr-2" />
                  Reorder Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {lowStockMedicines.length === 0 && (
          <Card className="col-span-full"><CardContent className="p-8 text-center text-muted-foreground">No low stock items</CardContent></Card>
        )}
      </div>

      {/* Reorder Dialog */}
      <Dialog open={isReorderOpen} onOpenChange={setIsReorderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Reorder {selectedMedicine?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Medicine</Label>
              <Input value={selectedMedicine?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity to Order</Label>
              <Input 
                type="number" 
                value={reorderQuantity} 
                onChange={(e) => setReorderQuantity(parseInt(e.target.value))} 
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Estimated Cost:</span>
                <span className="font-semibold">
                  ${(reorderQuantity * (selectedMedicine?.unitPrice || 0) * 0.7 * 1.1).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReorderOpen(false)}>Cancel</Button>
            <Button onClick={confirmReorder}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">This feature is coming soon</p>
      </div>
    </div>
  );
}

export default function PharmacyDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Pharmacy Dashboard">
      <Routes>
        <Route index element={<PharmacyOverview />} />
        <Route path="dispense" element={<PharmacyDispense />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="low-stock" element={<LowStock />} />
        <Route path="expiring" element={<PharmacyExpiring />} />
        <Route path="purchases" element={<PharmacyPurchases />} />
        <Route path="reports" element={<PharmacyReports />} />
      </Routes>
    </DashboardLayout>
  );
}
