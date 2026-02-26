import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getData } from '@/lib/mockData';
import {
  mockBloodInventory,
  mockBloodRequests,
  mockBloodCollections,
  mockBloodStorage,
  mockActivityLogs,
} from '@/lib/bloodBankData';
import {
  LayoutDashboard,
  Droplets,
  Users,
  TestTube,
  FlaskConical,
  Warehouse,
  ArrowRightLeft,
  ClipboardList,
  FileBarChart,
  AlertTriangle,
  Activity,
  Shield,
} from 'lucide-react';

import BloodInventoryPage from './BloodInventoryPage';
import BloodDonorPage from './BloodDonorPage';
import BloodCollectionPage from './BloodCollectionPage';
import BloodTestingPage from './BloodTestingPage';
import BloodStoragePage from './BloodStoragePage';
import BloodIssuePage from './BloodIssuePage';
import BloodRequestPage from './BloodRequestPage';
import BloodReportsPage from './BloodReportsPage';
import BloodActivityLogPage from './BloodActivityLogPage';

const navItems = [
  { title: 'Dashboard', href: '/bloodbank', icon: LayoutDashboard },
  { title: 'Inventory', href: '/bloodbank/inventory', icon: Droplets },
  { title: 'Donors', href: '/bloodbank/donors', icon: Users },
  { title: 'Collection', href: '/bloodbank/collection', icon: TestTube },
  { title: 'Testing', href: '/bloodbank/testing', icon: FlaskConical },
  { title: 'Storage', href: '/bloodbank/storage', icon: Warehouse },
  { title: 'Issue & Transfusion', href: '/bloodbank/issue', icon: ArrowRightLeft },
  { title: 'Requests', href: '/bloodbank/requests', icon: ClipboardList },
  { title: 'Reports', href: '/bloodbank/reports', icon: FileBarChart },
  { title: 'Activity Log', href: '/bloodbank/activity', icon: Shield },
];

function BloodBankOverview() {
  const navigate = useNavigate();
  const inventory = getData('bloodInventory', mockBloodInventory);
  const requests = getData('bloodRequests', mockBloodRequests);
  const collections = getData('bloodCollections', mockBloodCollections);
  const storage = getData('bloodStorage', mockBloodStorage);
  const logs = getData('bloodActivityLogs', mockActivityLogs);

  const totalUnits = inventory.reduce((sum, i) => sum + i.units, 0);
  const lowStockItems = inventory.filter(i => i.units <= i.lowStockThreshold);
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const expiringSoon = storage.filter(s => {
    if (s.status !== 'stored') return false;
    const expiry = new Date(s.expiryDate);
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);
    return expiry <= sevenDays;
  }).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Blood Units" value={totalUnits} description="Across all blood groups" icon={Droplets} />
        <StatsCard title="Low Stock Alerts" value={lowStockItems.length} description="Below threshold" icon={AlertTriangle} />
        <StatsCard title="Pending Requests" value={pendingRequests} description="Awaiting approval" icon={ClipboardList} />
        <StatsCard title="Expiring Soon" value={expiringSoon} description="Within 7 days" icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Blood Group Inventory */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Blood Group Inventory</CardTitle>
              <CardDescription>Current stock levels by blood group</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/bloodbank/inventory')}>Manage</Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {inventory.map((item) => {
                const percentage = Math.min((item.units / (item.lowStockThreshold * 3)) * 100, 100);
                const isLow = item.units <= item.lowStockThreshold;
                return (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={isLow ? 'destructive' : 'outline'} className="text-sm font-bold">{item.bloodGroup}</Badge>
                        <span className="font-semibold">{item.units} units</span>
                      </div>
                      {isLow && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Threshold: {item.lowStockThreshold} units</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.filter(r => r.status === 'pending').slice(0, 3).map((req) => (
                <div key={req.id} className={`p-3 rounded-lg border ${req.priority === 'emergency' ? 'border-destructive/50 bg-destructive/5' : req.priority === 'urgent' ? 'border-amber-300 bg-amber-50' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{req.patientName}</span>
                    <Badge variant={req.priority === 'emergency' ? 'destructive' : req.priority === 'urgent' ? 'default' : 'secondary'}>
                      {req.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{req.bloodGroup} • {req.units} units • By {req.requestedBy}</p>
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-xs w-full" onClick={() => navigate('/bloodbank/requests')}>Review</Button>
                </div>
              ))}
              {requests.filter(r => r.status === 'pending').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className="p-1.5 bg-primary/10 rounded-md h-fit">
                    <Activity className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Blood groups that need immediate replenishment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-4 bg-card rounded-lg border border-destructive/20 text-center">
                  <Badge variant="destructive" className="text-lg px-3 py-1 mb-2">{item.bloodGroup}</Badge>
                  <p className="text-2xl font-bold">{item.units}</p>
                  <p className="text-xs text-muted-foreground">units remaining</p>
                  <p className="text-xs text-destructive mt-1">Min: {item.lowStockThreshold} units</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BloodBankDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Blood Bank Dashboard">
      <Routes>
        <Route index element={<BloodBankOverview />} />
        <Route path="inventory" element={<BloodInventoryPage />} />
        <Route path="donors" element={<BloodDonorPage />} />
        <Route path="collection" element={<BloodCollectionPage />} />
        <Route path="testing" element={<BloodTestingPage />} />
        <Route path="storage" element={<BloodStoragePage />} />
        <Route path="issue" element={<BloodIssuePage />} />
        <Route path="requests" element={<BloodRequestPage />} />
        <Route path="reports" element={<BloodReportsPage />} />
        <Route path="activity" element={<BloodActivityLogPage />} />
      </Routes>
    </DashboardLayout>
  );
}
