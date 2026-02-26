import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getData, mockAppointments, mockPatients, mockLabTests } from '@/lib/mockData';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  FlaskConical,
  Pill,
  Bell,
  ClipboardList,
  Clock,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

import { DoctorAppointments } from './DoctorAppointments';
import { DoctorPatients } from './DoctorPatients';
import { DoctorLabTests } from './DoctorLabTests';
import { DoctorPrescriptions } from './DoctorPrescriptions';
import { DoctorMedicalRecords } from './DoctorMedicalRecords';
import { DoctorNotifications } from './DoctorNotifications';

const navItems = [
  { title: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
  { title: 'Appointments', href: '/doctor/appointments', icon: Calendar },
  { title: 'Patients', href: '/doctor/patients', icon: Users },
  { title: 'Lab Tests', href: '/doctor/lab-tests', icon: FlaskConical },
  { title: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill },
  { title: 'Medical Records', href: '/doctor/records', icon: FileText },
  { title: 'Notifications', href: '/doctor/notifications', icon: Bell },
];

function DoctorOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const appointments = getData('appointments', mockAppointments);
  const patients = getData('patients', mockPatients);
  const labTests = getData('labTests', mockLabTests);

  const myAppointments = appointments.filter(a => a.doctorId === user?.id || a.doctorName.includes('Michael'));
  const todayAppointments = myAppointments.filter(a => a.date === '2024-03-15');
  const completedToday = todayAppointments.filter(a => a.status === 'completed').length;
  const pendingLabReports = labTests.filter(l => l.status === 'completed' && l.doctorId === user?.id).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.name}</h2>
              <p className="text-primary-foreground/80 mt-1">
                {user?.specialization} • {user?.department}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/70">Today's Date</p>
              <p className="text-lg font-semibold">March 15, 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Appointments"
          value={todayAppointments.length}
          description={`${completedToday} completed`}
          icon={Calendar}
        />
        <StatsCard
          title="Total Patients"
          value={patients.length}
          description="Under your care"
          icon={Users}
        />
        <StatsCard
          title="Pending Lab Reports"
          value={pendingLabReports}
          description="Awaiting review"
          icon={FlaskConical}
        />
        <StatsCard
          title="Follow-ups Due"
          value={3}
          description="This week"
          icon={Clock}
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>Your scheduled patients for today</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/doctor/appointments')}>
              <Calendar className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <Badge variant="outline">#{apt.tokenNumber}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{apt.patientName}</TableCell>
                    <TableCell>{apt.time}</TableCell>
                    <TableCell className="capitalize">{apt.type}</TableCell>
                    <TableCell>
                      <StatusBadge status={apt.status} />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => toast.info(`Starting consultation with ${apt.patientName}`)}>
                        {apt.status === 'scheduled' ? 'Start' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/doctor/prescriptions')}>
                <Pill className="h-4 w-4 mr-2" />
                Write Prescription
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/doctor/lab-tests')}>
                <FlaskConical className="h-4 w-4 mr-2" />
                Request Lab Test
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/doctor/records')}>
                <FileText className="h-4 w-4 mr-2" />
                View Patient History
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/doctor/patients')}>
                <UserCheck className="h-4 w-4 mr-2" />
                Add Follow-up
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">Critical Lab Result</p>
                <p className="text-xs text-muted-foreground mt-1">John Smith - Elevated BP levels</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-sm font-medium">Lab Report Ready</p>
                <p className="text-xs text-muted-foreground mt-1">Mary Johnson - Lipid Panel</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-sm font-medium">Follow-up Reminder</p>
                <p className="text-xs text-muted-foreground mt-1">James Williams - Tomorrow 10 AM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">This feature is coming soon</p>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Doctor Dashboard">
      <Routes>
        <Route index element={<DoctorOverview />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="lab-tests" element={<DoctorLabTests />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="records" element={<DoctorMedicalRecords />} />
        <Route path="notifications" element={<DoctorNotifications />} />
      </Routes>
    </DashboardLayout>
  );
}
