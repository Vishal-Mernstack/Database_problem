import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getData, mockLabTests } from '@/lib/mockData';
import { FileText, Download, Eye, Calendar, TestTube } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { LabTest } from '@/types';
import { exportToPDF, generateTableHTML } from '@/lib/exportUtils';

export default function PatientLabReports() {
  const { user } = useAuth();
  
  // Read from shared lab tests storage
  const labTests: LabTest[] = getData('labTests', mockLabTests);
  
  // Filter for current patient
  const myLabTests = labTests.filter(l => l.patientId === user?.id);
  
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const completedTests = myLabTests.filter(t => t.status === 'completed');
  const pendingTests = myLabTests.filter(t => t.status !== 'completed');

  const handleViewReport = (test: LabTest) => {
    setSelectedTest(test);
    setIsViewOpen(true);
  };

  const handleDownload = (test: LabTest) => {
    const content = `
      <h2>Test Information</h2>
      ${generateTableHTML(
        ['Field', 'Value'],
        [
          ['Test Name', test.testName],
          ['Test Type', test.testType],
          ['Requested By', test.doctorName],
          ['Request Date', test.requestDate],
          ['Completed Date', test.completedDate || 'N/A'],
          ['Status', test.status],
          ['Result', test.result || 'Within normal limits'],
        ]
      )}
    `;
    exportToPDF(`Lab Report - ${test.testName}`, content, `lab_report_${test.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Lab Reports</h2>
        <p className="text-muted-foreground">View and download your test results</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTests.length}</p>
              <p className="text-xs text-muted-foreground">Reports Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <TestTube className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingTests.length}</p>
              <p className="text-xs text-muted-foreground">Tests In Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {completedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Download or view your completed test results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{test.testName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{test.testType}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {test.completedDate || test.requestDate}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{test.doctorName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewReport(test)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" onClick={() => handleDownload(test)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {pendingTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tests In Progress</CardTitle>
            <CardDescription>Pending test results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <TestTube className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{test.testName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{test.testType}</Badge>
                      <span className="text-sm text-muted-foreground">Requested: {test.requestDate}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={test.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {myLabTests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No lab reports available</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Lab Report</DialogTitle>
            <DialogDescription>{selectedTest?.testName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Test Type</p>
                <p className="font-medium">{selectedTest?.testType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{selectedTest?.completedDate || selectedTest?.requestDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ordered By</p>
                <p className="font-medium">{selectedTest?.doctorName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={selectedTest?.status || 'completed'} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Results</p>
              <div className="p-4 border rounded-lg bg-background min-h-[150px] whitespace-pre-wrap">
                {selectedTest?.result || 'Results within normal limits. No abnormalities detected.'}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button onClick={() => { handleDownload(selectedTest!); setIsViewOpen(false); }}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
