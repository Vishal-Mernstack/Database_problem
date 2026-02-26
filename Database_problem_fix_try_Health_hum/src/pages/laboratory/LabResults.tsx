import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockLabTests } from '@/lib/mockData';
import { LabTest } from '@/types';
import { toast } from 'sonner';
import { Search, FileCheck, Upload, Download, Printer } from 'lucide-react';

export default function LabResults() {
  const { data: labTests, updateItem } = useLocalStorage<LabTest>('labTests', mockLabTests);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [resultData, setResultData] = useState('');

  const completedTests = labTests.filter(t => t.status === 'completed');
  const filteredTests = completedTests.filter(t =>
    t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.testName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadResult = (test: LabTest) => {
    setSelectedTest(test);
    setResultData(test.result || '');
    setIsUploadOpen(true);
  };

  const handleViewResult = (test: LabTest) => {
    setSelectedTest(test);
    setIsViewOpen(true);
  };

  const saveResult = () => {
    if (selectedTest) {
      updateItem(selectedTest.id, { result: resultData });
      toast.success('Result saved successfully');
      setIsUploadOpen(false);
    }
  };

  const printReport = () => {
    const printContent = `
      LAB REPORT
      ==========
      Patient: ${selectedTest?.patientName}
      Test: ${selectedTest?.testName}
      Type: ${selectedTest?.testType}
      Date: ${selectedTest?.completedDate || new Date().toLocaleDateString()}
      
      RESULTS
      -------
      ${selectedTest?.result || 'No results available'}
      
      Doctor: ${selectedTest?.doctorName}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('Report sent to printer');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lab Results</h2>
          <p className="text-muted-foreground">View and manage completed test results</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {completedTests.length} Completed
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search completed tests..." 
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Completed Tests
          </CardTitle>
          <CardDescription>All tests with results ready</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell><Badge variant="outline">{test.id.toUpperCase()}</Badge></TableCell>
                  <TableCell className="font-medium">{test.patientName}</TableCell>
                  <TableCell>{test.testName}</TableCell>
                  <TableCell><Badge variant="secondary">{test.testType}</Badge></TableCell>
                  <TableCell>{test.completedDate ? new Date(test.completedDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell><StatusBadge status={test.status} /></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewResult(test)}>
                        <FileCheck className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleUploadResult(test)}>
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No completed tests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload/Edit Result</DialogTitle>
            <DialogDescription>
              {selectedTest?.testName} for {selectedTest?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Test Result</Label>
              <Textarea 
                rows={10}
                value={resultData}
                onChange={(e) => setResultData(e.target.value)}
                placeholder="Enter test results..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button onClick={saveResult}>Save Result</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Lab Report</DialogTitle>
            <DialogDescription>
              {selectedTest?.testName} - {selectedTest?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{selectedTest?.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Test Type</p>
                <p className="font-medium">{selectedTest?.testType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested By</p>
                <p className="font-medium">{selectedTest?.doctorName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Date</p>
                <p className="font-medium">{selectedTest?.completedDate || '-'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Results</Label>
              <div className="p-4 border rounded-lg bg-background min-h-[150px] whitespace-pre-wrap">
                {selectedTest?.result || 'No results available'}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button variant="outline" onClick={printReport}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => toast.success('Report downloaded')}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
