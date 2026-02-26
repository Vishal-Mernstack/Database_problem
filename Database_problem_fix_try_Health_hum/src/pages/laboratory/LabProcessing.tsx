import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockLabTests } from '@/lib/mockData';
import { LabTest } from '@/types';
import { toast } from 'sonner';
import { Search, Clock, Play, CheckCircle } from 'lucide-react';

export default function LabProcessing() {
  const { data: labTests, updateItem } = useLocalStorage<LabTest>('labTests', mockLabTests);
  const [searchQuery, setSearchQuery] = useState('');

  const collectedTests = labTests.filter(t => t.status === 'sample-collected');
  const processingTests = labTests.filter(t => t.status === 'processing');

  const filteredCollected = collectedTests.filter(t =>
    t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.testName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProcessing = processingTests.filter(t =>
    t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.testName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startProcessing = (test: LabTest) => {
    updateItem(test.id, { status: 'processing' });
    toast.success(`Started processing ${test.testName} for ${test.patientName}`);
  };

  const completeProcessing = (test: LabTest) => {
    updateItem(test.id, { 
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0],
    });
    toast.success(`Completed ${test.testName} for ${test.patientName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Lab Processing</h2>
        <p className="text-muted-foreground">Manage sample processing workflow</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search tests..." 
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ready for Processing
                </CardTitle>
                <CardDescription>Samples waiting to be processed</CardDescription>
              </div>
              <Badge variant="secondary">{filteredCollected.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollected.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.patientName}</TableCell>
                    <TableCell>{test.testName}</TableCell>
                    <TableCell><Badge variant="outline">{test.testType}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => startProcessing(test)}>
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCollected.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No samples ready for processing
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  In Progress
                </CardTitle>
                <CardDescription>Currently being processed</CardDescription>
              </div>
              <Badge variant="secondary">{filteredProcessing.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcessing.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.patientName}</TableCell>
                    <TableCell>{test.testName}</TableCell>
                    <TableCell><StatusBadge status={test.status} /></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => completeProcessing(test)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProcessing.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No tests in progress
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
