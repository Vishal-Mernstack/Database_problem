import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getData, mockBills } from '@/lib/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, DollarSign, TrendingUp, Receipt, CreditCard } from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtils';

export default function BillingReports() {
  const bills = getData('bills', mockBills);

  const totalRevenue = bills.reduce((sum, b) => sum + (b.status === 'paid' ? b.total : 0), 0);
  const pendingAmount = bills.reduce((sum, b) => sum + (b.status === 'pending' ? b.total : 0), 0);
  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.status === 'paid').length;

  const paymentMethods = [
    { name: 'Cash', value: 35, color: '#34d399' },
    { name: 'Credit Card', value: 40, color: '#60a5fa' },
    { name: 'Insurance', value: 20, color: '#a78bfa' },
    { name: 'Other', value: 5, color: '#fbbf24' },
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 12500, expenses: 8000 },
    { month: 'Feb', revenue: 15000, expenses: 9500 },
    { month: 'Mar', revenue: 18000, expenses: 10000 },
    { month: 'Apr', revenue: 14000, expenses: 8500 },
    { month: 'May', revenue: 20000, expenses: 11000 },
    { month: 'Jun', revenue: 22500, expenses: 12000 },
  ];

  const dailyData = [
    { day: 'Mon', amount: 2500 },
    { day: 'Tue', amount: 3200 },
    { day: 'Wed', amount: 2800 },
    { day: 'Thu', amount: 4100 },
    { day: 'Fri', amount: 3500 },
    { day: 'Sat', amount: 1800 },
    { day: 'Sun', amount: 900 },
  ];

  const exportReport = () => {
    const reportData = bills.map(b => ({
      InvoiceID: b.id,
      Patient: b.patientName,
      Date: b.date,
      Subtotal: b.subtotal,
      Discount: b.discount,
      Tax: b.tax,
      Total: b.total,
      Status: b.status,
      PaymentMethod: b.paymentMethod || 'N/A',
    }));
    exportToCSV(reportData, 'billing_report');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">Revenue analytics and insights</p>
        </div>
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Receipt className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{paidBills}/{totalBills}</p>
                <p className="text-xs text-muted-foreground">Paid Bills</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">+12%</p>
                <p className="text-xs text-muted-foreground">Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#94a3b8" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Collections</CardTitle>
            <CardDescription>This week's payment trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
