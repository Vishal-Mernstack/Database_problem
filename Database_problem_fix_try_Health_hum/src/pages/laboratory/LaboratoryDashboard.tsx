import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getData, mockLabTests } from '@/lib/mockData';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  FlaskConical,
  TestTube,
  FileCheck,
  Clock,
  Search,
  Upload,
  Bell,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

import LabSampleCollection from './LabSampleCollection';
import LabProcessing from './LabProcessing';
import LabResults from './LabResults';
import LabReports from './LabReports';
import LabNotifications from './LabNotifications';

const navItems = [
  { title: 'Dashboard', href: '/lab', icon: LayoutDashboard },
  { title: 'Test Requests', href: '/lab/requests', icon: FlaskConical },
  { title: 'Sample Collection', href: '/lab/samples', icon: TestTube },
  { title: 'Processing', href: '/lab/processing', icon: Clock },
  { title: 'Results', href: '/lab/results', icon: FileCheck },
  { title: 'Reports', href: '/lab/reports', icon: Upload },
  { title: 'Notifications', href: '/lab/notifications', icon: Bell },
];

function LabOverview() {
  const navigate = useNavigate();
  const labTests = getData('labTests', mockLabTests);
  
  const pendingRequests = labTests.filter(t => t.status === 'requested').length;
  const inProcessing = labTests.filter(t => t.status === 'processing').length;
  const completedToday = labTests.filter(t => t.status === 'completed').length;
  const sampleCollected = labTests.filter(t => t.status === 'sample-collected').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Pending Requests" value={pendingRequests} description="Awaiting sample collection" icon={FlaskConical} />
        <StatsCard title="Samples Collected" value={sampleCollected} description="Ready for processing" icon={TestTube} />
        <StatsCard title="In Processing" value={inProcessing} description="Tests being analyzed" icon={Clock} />
        <StatsCard title="Completed" value={completedToday} description="Reports ready" icon={FileCheck} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by patient or test..." className="pl-9" />
        </div>
        <Button variant="outline" onClick={() => navigate('/lab/reports')}><Upload className="h-4 w-4 mr-2" />Upload Report</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lab Test Requests</CardTitle>
            <CardDescription>All test requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell><Badge variant="outline">{test.id.toUpperCase()}</Badge></TableCell>
                    <TableCell className="font-medium">{test.patientName}</TableCell>
                    <TableCell>{test.testName}</TableCell>
                    <TableCell><StatusBadge status={test.status} /></TableCell>
                    <TableCell>
                      {test.status === 'requested' && <Button size="sm" variant="outline" onClick={() => { navigate('/lab/samples'); toast.info(`Collecting sample for ${test.patientName}`); }}>Collect Sample</Button>}
                      {test.status === 'sample-collected' && <Button size="sm" variant="outline" onClick={() => { navigate('/lab/processing'); toast.info(`Processing ${test.testName}`); }}>Start Processing</Button>}
                      {test.status === 'processing' && <Button size="sm" variant="outline" onClick={() => { navigate('/lab/results'); toast.info('Upload result'); }}>Upload Result</Button>}
                      {test.status === 'completed' && <Button size="sm" variant="outline" onClick={() => { navigate('/lab/reports'); toast.info('Viewing report'); }}>View Report</Button>}
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
              <CardTitle>Processing Queue</CardTitle>
              <CardDescription>Tests awaiting action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {labTests.filter(t => t.status !== 'completed').map((test) => (
                <div key={test.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{test.patientName}</span>
                    <StatusBadge status={test.status} />
                  </div>
                  <p className="text-sm">{test.testName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Requested: {new Date(test.requestDate).toLocaleDateString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5" />Urgent Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-sm">MRI Brain - James Williams</span>
                </div>
                <p className="text-xs text-muted-foreground">Priority: Urgent | Due: Today</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LaboratoryDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Laboratory Dashboard">
      <Routes>
        <Route index element={<LabOverview />} />
        <Route path="requests" element={<LabOverview />} />
        <Route path="samples" element={<LabSampleCollection />} />
        <Route path="processing" element={<LabProcessing />} />
        <Route path="results" element={<LabResults />} />
        <Route path="reports" element={<LabReports />} />
        <Route path="notifications" element={<LabNotifications />} />
      </Routes>
    </DashboardLayout>
  );
}