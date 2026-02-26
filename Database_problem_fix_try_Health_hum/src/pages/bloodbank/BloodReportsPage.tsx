import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getData } from '@/lib/mockData';
import { mockBloodInventory, mockBloodDonors, mockBloodIssues, mockBloodRequests, mockBloodStorage } from '@/lib/bloodBankData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Droplets, Users, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtils';

export default function BloodReportsPage() {
  const inventory = getData('bloodInventory', mockBloodInventory);
  const donors = getData('bloodDonors', mockBloodDonors);
  const issues = getData('bloodIssues', mockBloodIssues);
  const requests = getData('bloodRequests', mockBloodRequests);
  const storage = getData('bloodStorage', mockBloodStorage);

  const totalUnits = inventory.reduce((sum, i) => sum + i.units, 0);
  const totalDonors = donors.length;
  const totalIssued = issues.length;
  const expiredUnits = storage.filter(s => s.status === 'expired').length;

  const inventoryChartData = inventory.map(i => ({ name: i.bloodGroup, units: i.units }));
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

  const monthlyUsage = [
    { month: 'Oct', collected: 45, issued: 38 },
    { month: 'Nov', collected: 52, issued: 41 },
    { month: 'Dec', collected: 38, issued: 45 },
    { month: 'Jan', collected: 60, issued: 50 },
    { month: 'Feb', collected: 55, issued: 48 },
    { month: 'Mar', collected: 48, issued: 42 },
  ];

  const exportInventoryReport = () => {
    exportToCSV(inventory.map(i => ({ BloodGroup: i.bloodGroup, Units: i.units, Threshold: i.lowStockThreshold, LastUpdated: i.lastUpdated })), 'blood_inventory_report');
  };

  const exportDonorReport = () => {
    exportToCSV(donors.map(d => ({ Name: d.name, BloodGroup: d.bloodGroup, Phone: d.phone, TotalDonations: d.totalDonations, LastDonation: d.lastDonationDate || 'N/A', NextEligible: d.nextEligibleDate || 'N/A' })), 'donor_report');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Blood Bank Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive blood bank statistics</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-2 bg-red-500/10 rounded-lg"><Droplets className="h-5 w-5 text-red-500" /></div><div><p className="text-2xl font-bold">{totalUnits}</p><p className="text-xs text-muted-foreground">Total Units</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-2 bg-blue-500/10 rounded-lg"><Users className="h-5 w-5 text-blue-500" /></div><div><p className="text-2xl font-bold">{totalDonors}</p><p className="text-xs text-muted-foreground">Registered Donors</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-2 bg-green-500/10 rounded-lg"><ArrowRightLeft className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{totalIssued}</p><p className="text-xs text-muted-foreground">Units Issued</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-2 bg-amber-500/10 rounded-lg"><AlertTriangle className="h-5 w-5 text-amber-500" /></div><div><p className="text-2xl font-bold">{expiredUnits}</p><p className="text-xs text-muted-foreground">Expired/Wasted</p></div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Blood Group Inventory</CardTitle><CardDescription>Current stock by blood group</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="units" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Blood Group Distribution</CardTitle><CardDescription>Percentage distribution</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={inventoryChartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="units">
                  {inventoryChartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Collection vs Issue</CardTitle><CardDescription>Blood collected vs issued per month</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="collected" fill="hsl(var(--primary))" name="Collected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="issued" fill="#94a3b8" name="Issued" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Reports</CardTitle><CardDescription>Download blood bank reports</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" className="justify-start" onClick={exportInventoryReport}><Download className="h-4 w-4 mr-2" />Blood Inventory Report (CSV)</Button>
          <Button variant="outline" className="justify-start" onClick={exportDonorReport}><Download className="h-4 w-4 mr-2" />Donor Activity Report (CSV)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
