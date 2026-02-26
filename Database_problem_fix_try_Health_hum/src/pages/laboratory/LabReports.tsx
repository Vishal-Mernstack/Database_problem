import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getData, mockLabTests } from '@/lib/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText, TrendingUp, TestTube } from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtils';

export default function LabReports() {
  const labTests = getData('labTests', mockLabTests);

  const testsByType = [
    { name: 'Hematology', count: labTests.filter(t => t.testType === 'Hematology').length },
    { name: 'Biochemistry', count: labTests.filter(t => t.testType === 'Biochemistry').length },
    { name: 'Radiology', count: labTests.filter(t => t.testType === 'Radiology').length },
    { name: 'Microbiology', count: labTests.filter(t => t.testType === 'Microbiology').length },
  ];

  const testsByStatus = [
    { name: 'Requested', value: labTests.filter(t => t.status === 'requested').length, color: '#fbbf24' },
    { name: 'Collected', value: labTests.filter(t => t.status === 'sample-collected').length, color: '#60a5fa' },
    { name: 'Processing', value: labTests.filter(t => t.status === 'processing').length, color: '#a78bfa' },
    { name: 'Completed', value: labTests.filter(t => t.status === 'completed').length, color: '#34d399' },
  ];

  const weeklyData = [
    { day: 'Mon', tests: 12 },
    { day: 'Tue', tests: 19 },
    { day: 'Wed', tests: 15 },
    { day: 'Thu', tests: 22 },
    { day: 'Fri', tests: 18 },
    { day: 'Sat', tests: 8 },
    { day: 'Sun', tests: 5 },
  ];

  const totalTests = labTests.length;
  const completedTests = labTests.filter(t => t.status === 'completed').length;
  const avgTurnaround = 2.4;
  const totalRevenue = labTests.reduce((sum, t) => sum + (t.cost || 0), 0);

  const exportReport = () => {
    const reportData = labTests.map(t => ({
      TestID: t.id,
      Patient: t.patientName,
      TestName: t.testName,
      Type: t.testType,
      Status: t.status,
      RequestDate: t.requestDate,
      Cost: t.cost || 0,
    }));
    exportToCSV(reportData, 'lab_report');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lab Reports & Analytics</h2>
          <p className="text-muted-foreground">Overview of laboratory operations</p>
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
              <div className="p-2 bg-primary/10 rounded-lg">
                <TestTube className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTests}</p>
                <p className="text-xs text-muted-foreground">Total Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTests}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgTurnaround}h</p>
                <p className="text-xs text-muted-foreground">Avg Turnaround</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Badge variant="outline" className="text-amber-500">${totalRevenue}</Badge>
              </div>
              <div>
                <p className="text-2xl font-bold">${totalRevenue}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tests by Type</CardTitle>
            <CardDescription>Distribution of test categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tests by Status</CardTitle>
            <CardDescription>Current workflow distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={testsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {testsByStatus.map((entry, index) => (
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
            <CardTitle>Weekly Test Volume</CardTitle>
            <CardDescription>Number of tests processed this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tests" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
