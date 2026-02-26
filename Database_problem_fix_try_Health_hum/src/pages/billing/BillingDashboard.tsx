import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getData, mockBills, mockPatients } from '@/lib/mockData';
import { Bill, BillItem } from '@/types';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  FileText,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Download,
  AlertCircle,
} from 'lucide-react';

import BillingPayments from './BillingPayments';
import BillingReports from './BillingReports';

const navItems = [
  { title: 'Dashboard', href: '/billing', icon: LayoutDashboard },
  { title: 'New Invoice', href: '/billing/new', icon: Plus },
  { title: 'Invoices', href: '/billing/invoices', icon: Receipt },
  { title: 'Payments', href: '/billing/payments', icon: CreditCard },
  { title: 'Pending Dues', href: '/billing/dues', icon: AlertCircle },
  { title: 'Reports', href: '/billing/reports', icon: FileText },
];

function BillingOverview() {
  const navigate = useNavigate();
  const bills = getData('bills', mockBills);
  
  const totalRevenue = bills.reduce((sum, bill) => sum + (bill.status === 'paid' ? bill.total : 0), 0);
  const pendingAmount = bills.reduce((sum, bill) => sum + (bill.status === 'pending' ? bill.total : 0), 0);
  const todayInvoices = bills.filter(b => b.date === '2024-03-15').length;
  const pendingBills = bills.filter(b => b.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} description="This month" icon={DollarSign} trend={{ value: 12, isPositive: true }} />
        <StatsCard title="Pending Amount" value={`₹${pendingAmount.toLocaleString()}`} description="To be collected" icon={AlertCircle} />
        <StatsCard title="Today's Invoices" value={todayInvoices} description="Generated today" icon={Receipt} />
        <StatsCard title="Pending Bills" value={pendingBills} description="Awaiting payment" icon={CreditCard} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/billing/new')}><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
          <Button variant="outline" onClick={() => navigate('/billing/reports')}><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest billing transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell><Badge variant="outline">{bill.id.toUpperCase()}</Badge></TableCell>
                    <TableCell className="font-medium">{bill.patientName}</TableCell>
                    <TableCell className="font-semibold">₹{bill.total.toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={bill.status} /></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate('/billing/invoices')}>View</Button>
                        {bill.status === 'pending' && <Button size="sm" onClick={() => navigate('/billing/payments')}>Pay</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>Today's collection overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Cash</span><span className="font-semibold">₹4,500.00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Credit Card</span><span className="font-semibold">₹8,900.00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Insurance</span><span className="font-semibold">₹12,500.00</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Collected</span><span className="text-xl font-bold">₹25,900.00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" />Overdue Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bills.filter(b => b.status === 'pending').map((bill) => (
                <div key={bill.id} className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{bill.patientName}</span>
                    <span className="font-semibold text-destructive">₹{bill.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Invoice: {bill.id.toUpperCase()}</p>
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-xs w-full" onClick={() => navigate('/billing/dues')}>Send Reminder</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InvoiceManagement() {
  const { data: bills, addItem, updateItem, deleteItem } = useLocalStorage<Bill>('bills', mockBills);
  const patients = getData('patients', mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] as BillItem[],
    discount: 0,
    status: 'pending' as Bill['status'],
    paymentMethod: '',
  });

  const filteredBills = bills.filter(b =>
    b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Bill>[] = [
    { key: 'id', header: 'Invoice ID', render: (b) => <Badge variant="outline">{b.id.toUpperCase()}</Badge> },
    { key: 'patientName', header: 'Patient', render: (b) => <span className="font-medium">{b.patientName}</span> },
    { key: 'date', header: 'Date', render: (b) => new Date(b.date).toLocaleDateString() },
    { key: 'total', header: 'Amount', render: (b) => <span className="font-semibold">₹{b.total.toFixed(2)}</span> },
    { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  ];

  const handleAdd = () => {
    setEditingBill(null);
    setFormData({ patientId: '', items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }], discount: 0, status: 'pending', paymentMethod: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      patientId: bill.patientId,
      items: bill.items,
      discount: bill.discount,
      status: bill.status,
      paymentMethod: bill.paymentMethod || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (bill: Bill) => {
    setDeleteBillId(bill.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteBillId) {
      deleteItem(deleteBillId);
      toast.success('Invoice deleted');
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal - formData.discount + tax;

    if (editingBill) {
      updateItem(editingBill.id, { ...formData, patientName: patient?.name || '', subtotal, tax, total });
      toast.success('Invoice updated');
    } else {
      const newBill: Bill = {
        id: `bill-${Date.now()}`,
        patientId: formData.patientId,
        patientName: patient?.name || '',
        date: new Date().toISOString().split('T')[0],
        items: formData.items,
        subtotal,
        discount: formData.discount,
        tax,
        total,
        status: 'pending',
      };
      addItem(newBill);
      toast.success('Invoice created');
    }
    setIsFormOpen(false);
  };

  const addLineItem = () => {
    setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }] });
  };

  const updateLineItem = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Invoices"
        description="Manage billing invoices"
        data={filteredBills}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search invoices..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="New Invoice"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingBill ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
            <DialogDescription>Enter invoice details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={formData.patientId} onValueChange={(v) => setFormData({ ...formData, patientId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {editingBill && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Bill['status'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>Add Item</Button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Input placeholder="Description" value={item.description} onChange={(e) => updateLineItem(index, 'description', e.target.value)} />
                    <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)} />
                    <Input type="number" step="0.01" placeholder="Price" value={item.unitPrice} onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} />
                    <Input type="number" placeholder="Total" value={item.total.toFixed(2)} disabled />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount (₹)</Label>
                  <Input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })} />
                </div>
                {formData.status === 'paid' && (
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
                      <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingBill ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} title="Delete Invoice" description="Are you sure you want to delete this invoice?" />
    </div>
  );
}

function PendingDues() {
  const bills = getData('bills', mockBills);
  const pendingBills = bills.filter(b => b.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pending Dues</h2>
        <p className="text-muted-foreground">Outstanding payments to be collected</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pendingBills.map((bill) => (
          <Card key={bill.id} className="border-destructive/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{bill.patientName}</CardTitle>
                <Badge variant="destructive">₹{bill.total.toFixed(2)}</Badge>
              </div>
              <CardDescription>Invoice: {bill.id.toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span>{new Date(bill.date).toLocaleDateString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Items</span><span>{bill.items.length}</span></div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm" onClick={() => toast.success('Payment recorded')}>Record Payment</Button>
                <Button variant="outline" size="sm" onClick={() => toast.success('Reminder sent')}>Send Reminder</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {pendingBills.length === 0 && (
          <Card className="col-span-full"><CardContent className="p-8 text-center text-muted-foreground">No pending dues</CardContent></Card>
        )}
      </div>
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

export default function BillingDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Billing Dashboard">
      <Routes>
        <Route index element={<BillingOverview />} />
        <Route path="new" element={<InvoiceManagement />} />
        <Route path="invoices" element={<InvoiceManagement />} />
        <Route path="payments" element={<BillingPayments />} />
        <Route path="dues" element={<PendingDues />} />
        <Route path="reports" element={<BillingReports />} />
      </Routes>
    </DashboardLayout>
  );
}
