import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { Plus, Search, Truck, Package, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  items: {
    medicineName: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
}

const initialOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    supplier: 'MediSupply Inc.',
    orderDate: '2024-03-10',
    expectedDelivery: '2024-03-18',
    items: [
      { medicineName: 'Amoxicillin 500mg', quantity: 500, unitCost: 0.5, total: 250 },
      { medicineName: 'Lisinopril 10mg', quantity: 300, unitCost: 0.8, total: 240 },
    ],
    subtotal: 490,
    tax: 49,
    total: 539,
    status: 'shipped',
    notes: 'Expected to arrive by Friday',
  },
  {
    id: 'PO-002',
    supplier: 'PharmaDist Co.',
    orderDate: '2024-03-12',
    expectedDelivery: '2024-03-20',
    items: [
      { medicineName: 'Metformin 500mg', quantity: 400, unitCost: 0.45, total: 180 },
      { medicineName: 'Aspirin 81mg', quantity: 1000, unitCost: 0.1, total: 100 },
      { medicineName: 'Omeprazole 20mg', quantity: 200, unitCost: 0.75, total: 150 },
    ],
    subtotal: 430,
    tax: 43,
    total: 473,
    status: 'confirmed',
  },
  {
    id: 'PO-003',
    supplier: 'GlobalMeds Ltd.',
    orderDate: '2024-03-08',
    expectedDelivery: '2024-03-15',
    items: [
      { medicineName: 'Insulin Glargine', quantity: 50, unitCost: 25, total: 1250 },
    ],
    subtotal: 1250,
    tax: 125,
    total: 1375,
    status: 'delivered',
  },
];

const suppliers = ['MediSupply Inc.', 'PharmaDist Co.', 'GlobalMeds Ltd.', 'HealthCare Supplies', 'MedWholesale Corp.'];

export function PharmacyPurchases() {
  const { data: orders, addItem: addOrder, updateItem } = useLocalStorage<PurchaseOrder>('purchaseOrders', initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);
  
  const [formData, setFormData] = useState({
    supplier: '',
    expectedDelivery: '',
    items: [{ medicineName: '', quantity: 0, unitCost: 0, total: 0 }],
    notes: '',
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500 gap-1"><CheckCircle className="h-3 w-3" />Confirmed</Badge>;
      case 'shipped':
        return <Badge className="bg-orange-500 gap-1"><Truck className="h-3 w-3" />Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500 gap-1"><Package className="h-3 w-3" />Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Cancelled</Badge>;
    }
  };

  const addFormItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicineName: '', quantity: 0, unitCost: 0, total: 0 }],
    });
  };

  const updateFormItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitCost') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitCost;
    }
    setFormData({ ...formData, items: newItems });
  };

  const removeFormItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    
    const newOrder: PurchaseOrder = {
      id: `PO-${Date.now().toString().slice(-6)}`,
      supplier: formData.supplier,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: formData.expectedDelivery,
      items: formData.items,
      subtotal,
      tax,
      total: subtotal + tax,
      status: 'pending',
      notes: formData.notes,
    };
    
    addOrder(newOrder);
    toast.success('Purchase order created');
    setIsFormOpen(false);
    setFormData({ supplier: '', expectedDelivery: '', items: [{ medicineName: '', quantity: 0, unitCost: 0, total: 0 }], notes: '' });
  };

  const handleView = (order: PurchaseOrder) => {
    setViewingOrder(order);
    setIsViewOpen(true);
  };

  const updateStatus = (orderId: string, newStatus: PurchaseOrder['status']) => {
    updateItem(orderId, { status: newStatus });
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
    setIsViewOpen(false);
  };

  const pendingValue = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').reduce((sum, o) => sum + o.total, 0);
  const shippedValue = orders.filter(o => o.status === 'shipped').reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Purchase Orders</h2>
          <p className="text-muted-foreground">Manage supplier orders and stock replenishment</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Truck className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'shipped').length}</p>
                <p className="text-sm text-muted-foreground">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(pendingValue + shippedValue).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(order.expectedDelivery).toLocaleDateString()}</TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleView(order)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Order ID</Label>
                  <p className="font-medium">{viewingOrder.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingOrder.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Supplier</Label>
                  <p className="font-medium">{viewingOrder.supplier}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expected Delivery</Label>
                  <p className="font-medium">{new Date(viewingOrder.expectedDelivery).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingOrder.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.medicineName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unitCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${viewingOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>${viewingOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${viewingOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {viewingOrder.status !== 'delivered' && viewingOrder.status !== 'cancelled' && (
                <div className="flex gap-2 pt-4">
                  {viewingOrder.status === 'pending' && (
                    <Button onClick={() => updateStatus(viewingOrder.id, 'confirmed')}>Confirm Order</Button>
                  )}
                  {viewingOrder.status === 'confirmed' && (
                    <Button onClick={() => updateStatus(viewingOrder.id, 'shipped')}>Mark Shipped</Button>
                  )}
                  {viewingOrder.status === 'shipped' && (
                    <Button onClick={() => updateStatus(viewingOrder.id, 'delivered')}>Mark Delivered</Button>
                  )}
                  <Button variant="destructive" onClick={() => updateStatus(viewingOrder.id, 'cancelled')}>Cancel</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
            <DialogDescription>Create a new order to replenish stock</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select value={formData.supplier} onValueChange={(v) => setFormData({ ...formData, supplier: v })}>
                    <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expected Delivery</Label>
                  <Input 
                    type="date" 
                    value={formData.expectedDelivery} 
                    onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Order Items</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addFormItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5 space-y-1">
                      <Label className="text-xs">Medicine</Label>
                      <Input 
                        value={item.medicineName}
                        onChange={(e) => updateFormItem(index, 'medicineName', e.target.value)}
                        placeholder="Medicine name"
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateFormItem(index, 'quantity', Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Unit Cost</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => updateFormItem(index, 'unitCost', Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Total</Label>
                      <Input value={`$${item.total.toFixed(2)}`} disabled />
                    </div>
                    <div className="col-span-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeFormItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Create Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
