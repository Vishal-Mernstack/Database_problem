import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getData, mockMedicines } from '@/lib/mockData';
import { Medicine } from '@/types';
import { toast } from 'sonner';
import { AlertTriangle, Calendar, Package, DollarSign, RotateCcw, Tag } from 'lucide-react';

export function PharmacyExpiring() {
  const { data: medicines, updateItem } = useLocalStorage<Medicine>('medicines', mockMedicines);
  const [activeTab, setActiveTab] = useState('30days');
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [returnQuantity, setReturnQuantity] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(20);

  const now = new Date();

  const getExpiringMedicines = (withinDays: number) => {
    const targetDate = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
    return medicines.filter(m => {
      const expiry = new Date(m.expiryDate);
      return expiry <= targetDate && expiry > now;
    }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  };

  const expiredMedicines = medicines.filter(m => new Date(m.expiryDate) <= now);
  const expiring30 = getExpiringMedicines(30);
  const expiring60 = getExpiringMedicines(60);
  const expiring90 = getExpiringMedicines(90);

  const calculateValue = (meds: typeof medicines) => {
    return meds.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days <= 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 7) return <Badge variant="destructive">{days} days</Badge>;
    if (days <= 30) return <Badge className="bg-orange-500">{days} days</Badge>;
    if (days <= 60) return <Badge className="bg-yellow-500 text-yellow-900">{days} days</Badge>;
    return <Badge variant="outline">{days} days</Badge>;
  };

  const handleReturn = (med: Medicine) => {
    setSelectedMedicine(med);
    setReturnQuantity(med.quantity);
    setIsReturnOpen(true);
  };

  const handleDiscount = (med: Medicine) => {
    setSelectedMedicine(med);
    setDiscountPercent(getDaysUntilExpiry(med.expiryDate) <= 7 ? 50 : 20);
    setIsDiscountOpen(true);
  };

  const confirmReturn = () => {
    if (!selectedMedicine || returnQuantity <= 0) return;
    
    const newQuantity = selectedMedicine.quantity - returnQuantity;
    updateItem(selectedMedicine.id, { quantity: Math.max(0, newQuantity) });
    
    // Log the return (in a real app, this would create a return record)
    const returns = JSON.parse(localStorage.getItem('medicineReturns') || '[]');
    returns.push({
      id: `return-${Date.now()}`,
      medicineId: selectedMedicine.id,
      medicineName: selectedMedicine.name,
      quantity: returnQuantity,
      reason: 'Near expiry',
      date: new Date().toISOString(),
      value: returnQuantity * selectedMedicine.unitPrice,
    });
    localStorage.setItem('medicineReturns', JSON.stringify(returns));
    
    toast.success(`Returned ${returnQuantity} units of ${selectedMedicine.name}`);
    setIsReturnOpen(false);
    setSelectedMedicine(null);
  };

  const confirmDiscount = () => {
    if (!selectedMedicine) return;
    
    const discountedPrice = selectedMedicine.unitPrice * (1 - discountPercent / 100);
    updateItem(selectedMedicine.id, { unitPrice: discountedPrice });
    
    toast.success(`Applied ${discountPercent}% discount to ${selectedMedicine.name}. New price: $${discountedPrice.toFixed(2)}`);
    setIsDiscountOpen(false);
    setSelectedMedicine(null);
  };

  const renderMedicineTable = (meds: typeof medicines) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Medicine</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Days Left</TableHead>
          <TableHead>Value at Risk</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {meds.map((med) => (
          <TableRow key={med.id}>
            <TableCell>
              <div>
                <p className="font-medium">{med.name}</p>
                <p className="text-xs text-muted-foreground">{med.genericName}</p>
              </div>
            </TableCell>
            <TableCell>{med.batchNumber}</TableCell>
            <TableCell>{med.quantity}</TableCell>
            <TableCell>{new Date(med.expiryDate).toLocaleDateString()}</TableCell>
            <TableCell>{getExpiryBadge(med.expiryDate)}</TableCell>
            <TableCell className="font-medium">${(med.quantity * med.unitPrice).toFixed(2)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleReturn(med)}>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Return
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDiscount(med)}>
                  <Tag className="h-3 w-3 mr-1" />
                  Discount
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {meds.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No medicines found in this category
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Expiring Medicines</h2>
        <p className="text-muted-foreground">Track and manage medicines approaching expiry</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiredMedicines.length}</p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiring30.length}</p>
                <p className="text-sm text-muted-foreground">Within 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiring60.length}</p>
                <p className="text-sm text-muted-foreground">Within 60 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">${calculateValue([...expiredMedicines, ...expiring30]).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Value at Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="expired" className="gap-2">
            Expired
            {expiredMedicines.length > 0 && <Badge variant="destructive">{expiredMedicines.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="30days" className="gap-2">
            30 Days
            {expiring30.length > 0 && <Badge className="bg-orange-500">{expiring30.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="60days" className="gap-2">
            60 Days
            <Badge variant="secondary">{expiring60.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="90days" className="gap-2">
            90 Days
            <Badge variant="secondary">{expiring90.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expired" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-red-600">Expired Medicines</CardTitle>
              <CardDescription>These medicines have passed their expiry date and should be disposed</CardDescription>
            </CardHeader>
            <CardContent>
              {renderMedicineTable(expiredMedicines)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="30days" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-orange-600">Expiring Within 30 Days</CardTitle>
              <CardDescription>Consider discounting or returning these items to prevent loss</CardDescription>
            </CardHeader>
            <CardContent>
              {renderMedicineTable(expiring30)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="60days" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expiring Within 60 Days</CardTitle>
              <CardDescription>Plan promotions or stock rotation for these items</CardDescription>
            </CardHeader>
            <CardContent>
              {renderMedicineTable(expiring60)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="90days" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expiring Within 90 Days</CardTitle>
              <CardDescription>Monitor these items for stock rotation</CardDescription>
            </CardHeader>
            <CardContent>
              {renderMedicineTable(expiring90)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Return Dialog */}
      <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Medicine to Supplier</DialogTitle>
            <DialogDescription>
              Process a return for {selectedMedicine?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Medicine</Label>
              <Input value={selectedMedicine?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <Input value={selectedMedicine?.quantity || 0} disabled />
            </div>
            <div className="space-y-2">
              <Label>Quantity to Return</Label>
              <Input 
                type="number" 
                value={returnQuantity} 
                onChange={(e) => setReturnQuantity(Math.min(parseInt(e.target.value) || 0, selectedMedicine?.quantity || 0))}
                max={selectedMedicine?.quantity}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Return Value:</span>
                <span className="font-semibold">${(returnQuantity * (selectedMedicine?.unitPrice || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnOpen(false)}>Cancel</Button>
            <Button onClick={confirmReturn}>Process Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={isDiscountOpen} onOpenChange={setIsDiscountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              Set a discount for {selectedMedicine?.name} to speed up sales
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Medicine</Label>
              <Input value={selectedMedicine?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Current Price</Label>
              <Input value={`$${selectedMedicine?.unitPrice.toFixed(2) || '0.00'}`} disabled />
            </div>
            <div className="space-y-2">
              <Label>Discount Percentage</Label>
              <Select value={discountPercent.toString()} onValueChange={(v) => setDiscountPercent(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="30">30%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>New Price:</span>
                <span className="font-semibold text-green-600">
                  ${((selectedMedicine?.unitPrice || 0) * (1 - discountPercent / 100)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>You Save Per Unit:</span>
                <span className="font-semibold">
                  ${((selectedMedicine?.unitPrice || 0) * (discountPercent / 100)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiscountOpen(false)}>Cancel</Button>
            <Button onClick={confirmDiscount}>Apply Discount</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
