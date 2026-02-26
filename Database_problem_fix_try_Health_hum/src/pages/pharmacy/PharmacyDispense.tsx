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
import { getData, mockMedicines, mockPatients } from '@/lib/mockData';
import { Medicine } from '@/types';
import { toast } from 'sonner';
import { Search, ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle } from 'lucide-react';

interface CartItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface DispenseRecord {
  id: string;
  patientId: string;
  patientName: string;
  prescriptionId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  dispensedAt: string;
  dispensedBy: string;
}

const initialRecords: DispenseRecord[] = [];

export function PharmacyDispense() {
  const { data: medicines, updateItem: updateMedicine } = useLocalStorage<Medicine>('medicines', mockMedicines);
  const { data: records, addItem: addRecord } = useLocalStorage<DispenseRecord>('dispenseRecords', initialRecords);
  const patients = getData('patients', mockPatients);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<DispenseRecord | null>(null);

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const addToCart = (medicine: Medicine) => {
    if (medicine.quantity <= 0) {
      toast.error('Medicine out of stock');
      return;
    }

    const existingItem = cart.find(item => item.medicineId === medicine.id);
    if (existingItem) {
      if (existingItem.quantity >= medicine.quantity) {
        toast.error('Cannot add more than available stock');
        return;
      }
      setCart(cart.map(item =>
        item.medicineId === medicine.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: 1,
        unitPrice: medicine.unitPrice,
        total: medicine.unitPrice,
      }]);
    }
    toast.success(`${medicine.name} added to cart`);
  };

  const updateCartQuantity = (medicineId: string, delta: number) => {
    const medicine = medicines.find(m => m.id === medicineId);
    const cartItem = cart.find(item => item.medicineId === medicineId);
    
    if (!cartItem || !medicine) return;

    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(item => item.medicineId !== medicineId));
    } else if (newQty > medicine.quantity) {
      toast.error('Cannot exceed available stock');
    } else {
      setCart(cart.map(item =>
        item.medicineId === medicineId
          ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
          : item
      ));
    }
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter(item => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setSelectedPatient('');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const confirmDispense = () => {
    const patient = patients.find(p => p.id === selectedPatient);
    
    // Create record
    const record: DispenseRecord = {
      id: `disp-${Date.now()}`,
      patientId: selectedPatient,
      patientName: patient?.name || 'Walk-in Customer',
      items: cart,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      dispensedAt: new Date().toISOString(),
      dispensedBy: 'Current Pharmacist',
    };
    
    // Update medicine stock
    cart.forEach(item => {
      const medicine = medicines.find(m => m.id === item.medicineId);
      if (medicine) {
        updateMedicine(medicine.id, { quantity: medicine.quantity - item.quantity });
      }
    });
    
    addRecord(record);
    setLastReceipt(record);
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);
    clearCart();
    toast.success('Medicines dispensed successfully');
  };

  const printReceipt = () => {
    if (!lastReceipt) return;
    
    const printContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            h2 { text-align: center; margin-bottom: 10px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; font-size: 12px; }
            .right { text-align: right; }
            .total { font-weight: bold; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>MediCare Pharmacy</h2>
          <p style="text-align: center; font-size: 12px;">Receipt #${lastReceipt.id}</p>
          <div class="divider"></div>
          <p>Patient: ${lastReceipt.patientName}</p>
          <p>Date: ${new Date(lastReceipt.dispensedAt).toLocaleString()}</p>
          <div class="divider"></div>
          <table>
            <tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th></tr>
            ${lastReceipt.items.map(item => `
              <tr>
                <td>${item.medicineName}</td>
                <td class="right">${item.quantity}</td>
                <td class="right">$${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          <div class="divider"></div>
          <table>
            <tr><td>Subtotal</td><td class="right">$${lastReceipt.subtotal.toFixed(2)}</td></tr>
            ${lastReceipt.discount > 0 ? `<tr><td>Discount</td><td class="right">-$${lastReceipt.discount.toFixed(2)}</td></tr>` : ''}
            <tr class="total"><td>Total</td><td class="right">$${lastReceipt.total.toFixed(2)}</td></tr>
          </table>
          <div class="divider"></div>
          <p style="text-align: center; font-size: 10px;">Thank you for your purchase!</p>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dispense Medicines</h2>
        <p className="text-muted-foreground">Process prescriptions and dispense medications</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Medicine Search & List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Available Medicines</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.genericName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={med.quantity <= med.reorderLevel ? 'destructive' : 'outline'}>
                          {med.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>${med.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => addToCart(med)}
                          disabled={med.quantity <= 0}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length})
                </CardTitle>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>Clear</Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.medicineId} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.medicineName}</p>
                          <p className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.medicineId, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.medicineId, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.medicineId)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Transaction</DialogTitle>
            <DialogDescription>Verify details and complete the dispense</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Patient (optional)</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger><SelectValue placeholder="Walk-in Customer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="walkin">Walk-in Customer</SelectItem>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount (%)</Label>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={discount} 
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={confirmDispense}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Dispense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Complete</DialogTitle>
          </DialogHeader>
          {lastReceipt && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="font-semibold">Medicines Dispensed Successfully</p>
                <p className="text-sm text-muted-foreground">Receipt #{lastReceipt.id}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p><strong>Patient:</strong> {lastReceipt.patientName}</p>
                <p><strong>Items:</strong> {lastReceipt.items.length}</p>
                <p><strong>Total:</strong> ${lastReceipt.total.toFixed(2)}</p>
                <p><strong>Payment:</strong> {lastReceipt.paymentMethod}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiptOpen(false)}>Close</Button>
            <Button onClick={printReceipt}>
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
