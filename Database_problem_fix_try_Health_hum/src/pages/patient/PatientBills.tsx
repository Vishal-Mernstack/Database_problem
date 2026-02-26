import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { mockBills } from '@/lib/mockData';
import { Bill } from '@/types';
import { toast } from 'sonner';
import { CreditCard, DollarSign, Download, Receipt } from 'lucide-react';
import { exportToPDF, generateTableHTML } from '@/lib/exportUtils';

export default function PatientBills() {
  const { user } = useAuth();
  const { data: bills, updateItem } = useLocalStorage<Bill>('bills', mockBills);
  const myBills = bills.filter(b => b.patientId === user?.id);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  const pendingBills = myBills.filter(b => b.status === 'pending');
  const paidBills = myBills.filter(b => b.status === 'paid');
  const totalPending = pendingBills.reduce((sum, b) => sum + b.total, 0);

  const handlePayNow = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentMethod('');
    setIsPaymentOpen(true);
  };

  const confirmPayment = () => {
    if (selectedBill && paymentMethod) {
      updateItem(selectedBill.id, { status: 'paid', paymentMethod });
      toast.success(`Payment of ₹${selectedBill.total.toFixed(2)} successful!`);
      setIsPaymentOpen(false);
    }
  };

  const handleDownload = (bill: Bill) => {
    const itemRows = bill.items.map(i => [i.description, i.quantity, `₹${i.unitPrice.toFixed(2)}`, `₹${i.total.toFixed(2)}`]);
    const content = `
      <h2>Invoice Details</h2>
      <p><strong>Invoice ID:</strong> ${bill.id.toUpperCase()}</p>
      <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
      <p><strong>Patient:</strong> ${bill.patientName}</p>
      <p><strong>Status:</strong> ${bill.status}</p>
      <h3>Services</h3>
      ${generateTableHTML(['Description', 'Qty', 'Unit Price', 'Total'], itemRows)}
      <div style="margin-top: 20px; text-align: right;">
        <p><strong>Subtotal:</strong> ₹${bill.subtotal.toFixed(2)}</p>
        <p><strong>Discount:</strong> -₹${bill.discount.toFixed(2)}</p>
        <p><strong>Tax:</strong> ₹${bill.tax.toFixed(2)}</p>
        <p style="font-size: 1.2em;"><strong>Total:</strong> ₹${bill.total.toFixed(2)}</p>
      </div>
    `;
    exportToPDF(`Invoice - ${bill.id.toUpperCase()}`, content, `invoice_${bill.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Bills</h2>
        <p className="text-muted-foreground">View and pay your bills</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">₹{totalPending.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Due</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Receipt className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingBills.length}</p>
              <p className="text-xs text-muted-foreground">Pending Bills</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{paidBills.length}</p>
              <p className="text-xs text-muted-foreground">Paid Bills</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Pending Bills</CardTitle>
            <CardDescription>Bills awaiting payment</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell><Badge variant="outline">{bill.id.toUpperCase()}</Badge></TableCell>
                    <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                    <TableCell>{bill.items.map(i => i.description).join(', ')}</TableCell>
                    <TableCell className="font-bold text-destructive">₹{bill.total.toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={bill.status} /></TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handlePayNow(bill)}>
                        <CreditCard className="h-4 w-4 mr-1" />
                        Pay Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All your billing transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell><Badge variant="outline">{bill.id.toUpperCase()}</Badge></TableCell>
                  <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                  <TableCell>{bill.items.map(i => i.description).join(', ')}</TableCell>
                  <TableCell className={`font-bold ${bill.status === 'pending' ? 'text-destructive' : ''}`}>
                    ₹{bill.total.toFixed(2)}
                  </TableCell>
                  <TableCell><StatusBadge status={bill.status} /></TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(bill)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {myBills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No bills found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <DialogDescription>
              Pay invoice {selectedBill?.id.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{selectedBill?.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Discount</span>
                <span>-₹{selectedBill?.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{selectedBill?.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">₹{selectedBill?.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Net Banking">Net Banking</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentMethod === 'Credit Card' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="123" type="password" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
            <Button onClick={confirmPayment} disabled={!paymentMethod}>
              Pay ₹{selectedBill?.total.toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
