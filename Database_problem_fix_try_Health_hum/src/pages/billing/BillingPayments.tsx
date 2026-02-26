import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockBills } from '@/lib/mockData';
import { Bill } from '@/types';
import { toast } from 'sonner';
import { Search, CreditCard, DollarSign, Receipt, Printer } from 'lucide-react';

interface Payment {
  id: string;
  billId: string;
  patientName: string;
  amount: number;
  method: string;
  date: string;
  reference: string;
}

export default function BillingPayments() {
  const { data: bills, updateItem } = useLocalStorage<Bill>('bills', mockBills);
  const [payments, setPayments] = useState<Payment[]>([
    { id: 'pay-1', billId: 'bill-1', patientName: 'James Williams', amount: 250, method: 'Cash', date: '2024-03-15', reference: 'PAY001' },
    { id: 'pay-2', billId: 'bill-2', patientName: 'Sarah Johnson', amount: 180, method: 'Credit Card', date: '2024-03-14', reference: 'PAY002' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: '',
    reference: '',
  });

  const pendingBills = bills.filter(b => b.status === 'pending');
  const filteredPayments = payments.filter(p =>
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecordPayment = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentData({ amount: bill.total, method: '', reference: `PAY${Date.now().toString().slice(-6)}` });
    setIsPaymentOpen(true);
  };

  const confirmPayment = () => {
    if (selectedBill && paymentData.method) {
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        billId: selectedBill.id,
        patientName: selectedBill.patientName,
        amount: paymentData.amount,
        method: paymentData.method,
        date: new Date().toISOString().split('T')[0],
        reference: paymentData.reference,
      };
      setPayments([newPayment, ...payments]);
      updateItem(selectedBill.id, { status: 'paid', paymentMethod: paymentData.method });
      toast.success(`Payment of ₹${paymentData.amount} recorded`);
      setIsPaymentOpen(false);
    }
  };

  const printReceipt = (payment: Payment) => {
    const receiptContent = `
      PAYMENT RECEIPT
      ===============
      Receipt No: ${payment.reference}
      Date: ${payment.date}
      
      Patient: ${payment.patientName}
      Bill ID: ${payment.billId.toUpperCase()}
      
      Amount Paid: ₹${payment.amount.toFixed(2)}
      Payment Method: ${payment.method}
      
      Thank you for your payment!
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${receiptContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('Receipt sent to printer');
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payments</h2>
          <p className="text-muted-foreground">Record and manage payments</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Total: ₹{totalCollected.toLocaleString()}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">₹{totalCollected}</p>
              <p className="text-xs text-muted-foreground">Total Collected</p>
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
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{payments.length}</p>
              <p className="text-xs text-muted-foreground">Transactions Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Bills</CardTitle>
            <CardDescription>Bills awaiting payment</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.patientName}</TableCell>
                    <TableCell className="font-semibold">₹{bill.total.toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={bill.status} /></TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleRecordPayment(bill)}>
                        <CreditCard className="h-4 w-4 mr-1" />
                        Pay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingBills.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No pending bills
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Payment transactions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search payments..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell><Badge variant="outline">{payment.reference}</Badge></TableCell>
                    <TableCell className="font-medium">{payment.patientName}</TableCell>
                    <TableCell className="font-semibold text-green-600">₹{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => printReceipt(payment)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Payment for {selectedBill?.patientName} - Invoice {selectedBill?.id.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Amount Due</Label>
              <div className="text-2xl font-bold">₹{selectedBill?.total.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <Input 
                type="number"
                step="0.01"
                value={paymentData.amount} 
                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentData.method} onValueChange={(v) => setPaymentData({ ...paymentData, method: v })}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input 
                value={paymentData.reference} 
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
            <Button onClick={confirmPayment}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
