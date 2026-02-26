import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { getData, mockAppointments, mockBills, mockLabTests } from '@/lib/mockData';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  User,
  MessageSquare,
  Download,
  Clock,
} from 'lucide-react';

import PatientLabReports from './PatientLabReports';
import PatientPrescriptions from './PatientPrescriptions';
import PatientBills from './PatientBills';
import PatientMessages from './PatientMessages';
import Profile from '@/pages/Profile';

const navItems = [
  { title: 'Dashboard', href: '/patient', icon: LayoutDashboard },
  { title: 'Appointments', href: '/patient/appointments', icon: Calendar },
  { title: 'Lab Reports', href: '/patient/reports', icon: FileText },
  { title: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
  { title: 'Bills', href: '/patient/bills', icon: CreditCard },
  { title: 'My Profile', href: '/profile', icon: User },
  { title: 'Messages', href: '/patient/messages', icon: MessageSquare },
];

function PatientOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const appointments = getData('appointments', mockAppointments);
  const bills = getData('bills', mockBills);
  const labTests = getData('labTests', mockLabTests);

  const myAppointments = appointments.filter(a => a.patientId === 'patient-1');
  const myBills = bills.filter(b => b.patientId === 'patient-1');
  const myLabTests = labTests.filter(l => l.patientId === 'patient-1');
  
  const upcomingAppointments = myAppointments.filter(a => a.status === 'scheduled');
  const pendingBills = myBills.filter(b => b.status === 'pending');
  const completedLabTests = myLabTests.filter(l => l.status === 'completed');

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary to-primary/80">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary-foreground">
              <AvatarFallback className="bg-primary-foreground text-primary text-xl">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="text-primary-foreground">
              <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
              <p className="text-primary-foreground/80">Your health journey, all in one place</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg"><Calendar className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming Appointments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg"><FileText className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{completedLabTests.length}</p>
              <p className="text-xs text-muted-foreground">Lab Reports Ready</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg"><Pill className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-xs text-muted-foreground">Active Prescriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-destructive/10 rounded-lg"><CreditCard className="h-5 w-5 text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold">{pendingBills.length}</p>
              <p className="text-xs text-muted-foreground">Pending Bills</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled visits</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/patient/appointments')}>
              <Calendar className="h-4 w-4 mr-2" />Book New
            </Button>
          </CardHeader>
          <CardContent>
            {myAppointments.length > 0 ? (
              <div className="space-y-4">
                {myAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg"><Clock className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="font-medium">{apt.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{apt.department}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{apt.date}</Badge>
                          <Badge variant="outline">{apt.time}</Badge>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments</p>
                <Button className="mt-4" onClick={() => navigate('/patient/appointments')}>Book Appointment</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lab Reports</CardTitle>
              <CardDescription>Your test results</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/patient/reports')}>View All</Button>
          </CardHeader>
          <CardContent>
            {myLabTests.length > 0 ? (
              <div className="space-y-3">
                {myLabTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{test.testName}</p>
                      <p className="text-sm text-muted-foreground">{test.testType}</p>
                      <p className="text-xs text-muted-foreground mt-1">Requested: {new Date(test.requestDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={test.status} />
                      {test.status === 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => toast.success('Downloading report...')}><Download className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No lab reports available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bills & Payments</CardTitle>
            <CardDescription>Your billing history</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
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
                  <TableCell className="font-semibold">₹{bill.total.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={bill.status} /></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toast.success('Downloading invoice...')}><Download className="h-4 w-4" /></Button>
                      {bill.status === 'pending' && <Button size="sm" onClick={() => navigate('/patient/bills')}>Pay Now</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PatientAppointments() {
  const appointments = getData('appointments', mockAppointments);
  const myAppointments = appointments.filter(a => a.patientId === 'patient-1');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Appointments</h2>
          <p className="text-muted-foreground">View and manage your appointments</p>
        </div>
        <Button onClick={() => setIsBookingOpen(true)}><Calendar className="h-4 w-4 mr-2" />Book Appointment</Button>
      </div>

      <div className="grid gap-4">
        {myAppointments.map((apt) => (
          <Card key={apt.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg"><Calendar className="h-6 w-6 text-primary" /></div>
                  <div>
                    <p className="font-semibold text-lg">{apt.doctorName}</p>
                    <p className="text-muted-foreground">{apt.department}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline">{apt.date}</Badge>
                      <Badge variant="outline">{apt.time}</Badge>
                      <Badge variant="secondary" className="capitalize">{apt.type}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={apt.status} />
                  {apt.status === 'scheduled' && (
                    <Button variant="outline" size="sm" onClick={() => toast.info('Reschedule feature coming soon')}>Reschedule</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>Schedule a new appointment with a doctor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Input placeholder="Select department" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Input type="time" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success('Appointment request submitted'); setIsBookingOpen(false); }}>Request Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PatientProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Profile</h2>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancel' : 'Edit'}</Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user?.name} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input defaultValue={user?.phone} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" defaultValue="1985-06-15" disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Input defaultValue="O+" disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input defaultValue="+1-555-0201" disabled={!isEditing} />
            </div>
          </div>
          {isEditing && (
            <Button className="mt-6" onClick={() => { toast.success('Profile updated'); setIsEditing(false); }}>Save Changes</Button>
          )}
        </CardContent>
      </Card>
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

export default function PatientDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Patient Portal">
      <Routes>
        <Route index element={<PatientOverview />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="reports" element={<PatientLabReports />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="bills" element={<PatientBills />} />
        <Route path="profile" element={<Profile />} />
        <Route path="messages" element={<PatientMessages />} />
      </Routes>
    </DashboardLayout>
  );
}
