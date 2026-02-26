import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockBills, mockPatients, mockAppointments, mockDepartments } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, FileText, TrendingUp, Users, DollarSign } from "lucide-react";
import { exportToCSV, exportToPDF, exportToExcel, generateTableHTML } from "@/lib/exportUtils";
import { useDatabaseCollection } from "@/hooks/useDatabaseCollection";
import { Appointment, Bill, Department, Patient } from "@/types";

export function AdminReports() {
  const { data: bills } = useDatabaseCollection<Bill>({ collection: "bills", initialData: mockBills });
  const { data: patients } = useDatabaseCollection<Patient>({ collection: "patients", initialData: mockPatients });
  const { data: appointments } = useDatabaseCollection<Appointment>({ collection: "appointments", initialData: mockAppointments });
  const { data: departments } = useDatabaseCollection<Department>({ collection: "departments", initialData: mockDepartments });

  const totalRevenue = bills.reduce((sum, bill) => sum + (bill.status === "paid" ? bill.total : 0), 0);

  const revenueData =
    bills.length > 0
      ? bills.slice(0, 6).map((bill, index) => ({
          month: `M${index + 1}`,
          revenue: bill.total,
        }))
      : [{ month: "M1", revenue: 0 }];

  const departmentData =
    departments.length > 0
      ? departments.map((department) => ({
          name: department.name,
          patients: Math.max(1, department.doctorCount + department.nurseCount),
        }))
      : [{ name: "General", patients: 0 }];

  const paymentMethodData = [
    { name: "Paid Bills", value: bills.filter((bill) => bill.status === "paid").length || 1 },
    { name: "Pending Bills", value: bills.filter((bill) => bill.status !== "paid").length || 1 },
    { name: "Patients", value: patients.length || 1 },
  ];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

  const handleExportAll = () => {
    const reportData = patients.map((patient) => ({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
    }));
    exportToCSV(reportData, "hospital_report");
  };

  const handleDownloadReport = (reportName: string, reportType: string) => {
    if (reportType === "PDF") {
      if (reportName === "Monthly Financial Report") {
        const tableContent = generateTableHTML(
          ["Month", "Revenue"],
          revenueData.map((row) => [row.month, `Rs ${row.revenue}`])
        );
        exportToPDF("Monthly Financial Report", tableContent, "financial_report");
      } else if (reportName === "Department Performance") {
        const tableContent = generateTableHTML(
          ["Department", "Patients"],
          departmentData.map((row) => [row.name, row.patients])
        );
        exportToPDF("Department Performance Report", tableContent, "department_report");
      }
    } else if (reportType === "Excel") {
      if (reportName === "Patient Statistics") {
        exportToExcel(
          patients.map((patient) => ({
            Name: patient.name,
            Email: patient.email,
            Phone: patient.phone,
            Gender: patient.gender,
            BloodGroup: patient.bloodGroup,
          })),
          "patient_statistics"
        );
      } else if (reportName === "Staff Attendance") {
        exportToExcel(
          departments.map((department) => ({
            Department: department.name,
            Doctors: department.doctorCount,
            Nurses: department.nurseCount,
          })),
          "staff_attendance"
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Hospital performance metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="current">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="last">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportAll}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">Rs {totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{patients.length}</p>
              <p className="text-xs text-muted-foreground">Total Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{appointments.length}</p>
              <p className="text-xs text-muted-foreground">Appointments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">+15.3%</p>
              <p className="text-xs text-muted-foreground">Growth Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Recent bill totals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patients by Department</CardTitle>
            <CardDescription>Department staffing scale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="patients" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Split</CardTitle>
            <CardDescription>Billing completion overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
            <CardDescription>Download pre-generated reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Monthly Financial Report", type: "PDF" },
              { name: "Patient Statistics", type: "Excel" },
              { name: "Department Performance", type: "PDF" },
              { name: "Staff Attendance", type: "Excel" },
            ].map((report) => (
              <div key={report.name} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{report.name}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.name, report.type)}>
                  <Download className="mr-2 h-4 w-4" />
                  {report.type}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

