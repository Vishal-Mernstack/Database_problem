import { Routes, Route, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockPatients, mockAppointments, mockDepartments, mockBeds, mockBills } from "@/lib/mockData";
import { useDatabaseCollection } from "@/hooks/useDatabaseCollection";
import { Appointment, Bed, Bill, Department, Patient } from "@/types";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  BedDouble,
  Settings,
  FileBarChart,
  DollarSign,
  Calendar,
  Stethoscope,
  TrendingUp,
  Activity,
} from "lucide-react";

import { StaffManagement } from "./StaffManagement";
import { PatientManagement } from "./PatientManagement";
import { DepartmentManagement } from "./DepartmentManagement";
import { BedManagement } from "./BedManagement";
import { AdminSettings } from "./AdminSettings";
import { AdminReports } from "./AdminReports";

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Staff Management", href: "/admin/staff", icon: UserCog },
  { title: "Patient Management", href: "/admin/patients", icon: Users },
  { title: "Departments", href: "/admin/departments", icon: Building2 },
  { title: "Bed Management", href: "/admin/beds", icon: BedDouble },
  { title: "Reports", href: "/admin/reports", icon: FileBarChart },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminOverview() {
  const navigate = useNavigate();
  const { data: patients } = useDatabaseCollection<Patient>({ collection: "patients", initialData: mockPatients });
  const { data: appointments } = useDatabaseCollection<Appointment>({
    collection: "appointments",
    initialData: mockAppointments,
  });
  const { data: departments } = useDatabaseCollection<Department>({
    collection: "departments",
    initialData: mockDepartments,
  });
  const { data: beds } = useDatabaseCollection<Bed>({ collection: "beds", initialData: mockBeds });
  const { data: bills } = useDatabaseCollection<Bill>({ collection: "bills", initialData: mockBills });

  const totalRevenue = bills.reduce((sum, bill) => sum + (bill.status === "paid" ? bill.total : 0), 0);
  const pendingRevenue = bills.reduce((sum, bill) => sum + (bill.status === "pending" ? bill.total : 0), 0);
  const occupiedBeds = beds.filter((bed) => bed.status === "occupied").length;
  const todayDate = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((appointment) => appointment.date === todayDate).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={patients.length}
          description="Registered patients"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard title="Today's Appointments" value={todayAppointments} description="Scheduled for today" icon={Calendar} />
        <StatsCard
          title="Total Revenue"
          value={`Rs ${totalRevenue.toLocaleString()}`}
          description="This month"
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Bed Occupancy"
          value={`${occupiedBeds}/${beds.length}`}
          description={`${beds.length ? Math.round((occupiedBeds / beds.length) * 100) : 0}% occupied`}
          icon={BedDouble}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Today's patient appointments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/patients")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.slice(0, 5).map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.patientName}</TableCell>
                    <TableCell>{appointment.doctorName}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <StatusBadge status={appointment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>Staff distribution by department</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/departments")}>
              Manage
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead className="text-center">Doctors</TableHead>
                  <TableHead className="text-center">Nurses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.slice(0, 5).map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.head}</TableCell>
                    <TableCell className="text-center">{department.doctorCount}</TableCell>
                    <TableCell className="text-center">{department.nurseCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardDescription>Active Doctors</CardDescription>
              <CardTitle className="text-2xl">27</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardDescription>Pending Bills</CardDescription>
              <CardTitle className="text-2xl">Rs {pendingRevenue.toLocaleString()}</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardDescription>This Month Growth</CardDescription>
              <CardTitle className="text-2xl">+15.3%</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard">
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="patients" element={<PatientManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="beds" element={<BedManagement />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="security" element={<AdminSettings />} />
      </Routes>
    </DashboardLayout>
  );
}

