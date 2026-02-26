import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getData, mockMedicines } from '@/lib/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, FileText, Download, Calendar } from 'lucide-react';
import { exportToCSV, exportToPDF, generateTableHTML } from '@/lib/exportUtils';

const salesData = [
  { month: 'Jan', sales: 12400, purchases: 8200 },
  { month: 'Feb', sales: 14200, purchases: 9100 },
  { month: 'Mar', sales: 13800, purchases: 7800 },
  { month: 'Apr', sales: 15600, purchases: 10200 },
  { month: 'May', sales: 16800, purchases: 9500 },
  { month: 'Jun', sales: 18200, purchases: 11200 },
];

const categoryData = [
  { name: 'Antibiotics', value: 35, color: '#0ea5e9' },
  { name: 'Cardiovascular', value: 25, color: '#8b5cf6' },
  { name: 'Diabetes', value: 20, color: '#10b981' },
  { name: 'Pain Relief', value: 12, color: '#f59e0b' },
  { name: 'Vitamins', value: 8, color: '#ef4444' },
];

const dailyDispensing = [
  { day: 'Mon', prescriptions: 45, otc: 23 },
  { day: 'Tue', prescriptions: 52, otc: 31 },
  { day: 'Wed', prescriptions: 48, otc: 28 },
  { day: 'Thu', prescriptions: 61, otc: 35 },
  { day: 'Fri', prescriptions: 55, otc: 42 },
  { day: 'Sat', prescriptions: 38, otc: 56 },
  { day: 'Sun', prescriptions: 22, otc: 18 },
];

const topSellingMedicines = [
  { name: 'Amoxicillin 500mg', sold: 245, revenue: 1225 },
  { name: 'Metformin 500mg', sold: 198, revenue: 990 },
  { name: 'Lisinopril 10mg', sold: 176, revenue: 1408 },
  { name: 'Aspirin 81mg', sold: 312, revenue: 624 },
  { name: 'Omeprazole 20mg', sold: 145, revenue: 1015 },
];

export function PharmacyReports() {
  const medicines = getData('medicines', mockMedicines);
  const [period, setPeriod] = useState('month');

  const totalInventoryValue = medicines.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);
  const lowStockCount = medicines.filter(m => m.quantity <= m.reorderLevel).length;

  const handleExport = () => {
    const reportData = medicines.map(m => ({
      Name: m.name,
      Category: m.category,
      Manufacturer: m.manufacturer,
      Quantity: m.quantity,
      UnitPrice: `$${m.unitPrice}`,
      ExpiryDate: m.expiryDate,
    }));
    exportToCSV(reportData, 'pharmacy_report');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Pharmacy performance insights and statistics</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">$18,245</p>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prescriptions Filled</p>
                <p className="text-2xl font-bold">342</p>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>+8.3%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">${totalInventoryValue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <TrendingDown className="h-4 w-4" />
                  <span>-2.1%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
                <p className="text-sm text-muted-foreground">Need reorder</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales & Purchases</TabsTrigger>
          <TabsTrigger value="dispensing">Dispensing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Sales vs Purchases</CardTitle>
                <CardDescription>Monthly comparison of revenue and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Bar dataKey="sales" name="Sales" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="purchases" name="Purchases" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Medicines</CardTitle>
                <CardDescription>Best performers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSellingMedicines.map((med, idx) => (
                    <div key={med.name} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.sold} units sold</p>
                      </div>
                      <span className="font-semibold text-green-600">${med.revenue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dispensing" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Dispensing Activity</CardTitle>
                <CardDescription>Prescriptions vs OTC sales by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyDispensing}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="prescriptions" name="Prescriptions" stroke="#0ea5e9" strokeWidth={2} />
                      <Line type="monotone" dataKey="otc" name="OTC Sales" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Distribution of sales across medicine categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Level Overview</CardTitle>
                <CardDescription>Current inventory status by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((cat) => {
                    const percentage = Math.floor(Math.random() * 40) + 60;
                    return (
                      <div key={cat.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Critical</Badge>
                      <span className="font-medium">3 items out of stock</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Immediate restocking required</p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-500">Low Stock</Badge>
                      <span className="font-medium">{lowStockCount} items below reorder level</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Consider placing orders soon</p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500 text-yellow-900">Expiring</Badge>
                      <span className="font-medium">5 items expiring within 30 days</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Plan promotions or returns</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
