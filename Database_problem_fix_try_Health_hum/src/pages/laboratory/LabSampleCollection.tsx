import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getData, mockLabTests, mockPatients } from '@/lib/mockData';
import { LabTest } from '@/types';
import { toast } from 'sonner';
import { TestTube, Search, User, Clock } from 'lucide-react';

export default function LabSampleCollection() {
  const { data: labTests, updateItem } = useLocalStorage<LabTest>('labTests', mockLabTests);
  const patients = getData('patients', mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [sampleData, setSampleData] = useState({
    sampleType: '',
    collectedBy: '',
    notes: '',
  });

  const pendingTests = labTests.filter(t => t.status === 'requested');
  const filteredTests = pendingTests.filter(t =>
    t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.testName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCollect = (test: LabTest) => {
    setSelectedTest(test);
    setSampleData({ sampleType: '', collectedBy: '', notes: '' });
    setIsCollectOpen(true);
  };

  const confirmCollection = () => {
    if (selectedTest) {
      updateItem(selectedTest.id, { 
        status: 'sample-collected',
      });
      toast.success(`Sample collected for ${selectedTest.patientName}`);
      setIsCollectOpen(false);
    }
  };

  const sampleTypes = ['Blood', 'Urine', 'Stool', 'Saliva', 'Tissue', 'Swab'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sample Collection</h2>
          <p className="text-muted-foreground">Collect samples for pending lab tests</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pendingTests.length} Pending
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by patient or test name..." 
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test) => {
          const patient = patients.find(p => p.id === test.patientId);
          return (
            <Card key={test.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{test.patientName}</CardTitle>
                  <StatusBadge status={test.status} />
                </div>
                <CardDescription>{test.testName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{patient?.gender || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TestTube className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{test.testType}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Requested: {new Date(test.requestDate).toLocaleDateString()}</span>
                  </div>
                  <Button className="w-full mt-4" onClick={() => handleCollect(test)}>
                    <TestTube className="h-4 w-4 mr-2" />
                    Collect Sample
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredTests.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending samples to collect</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isCollectOpen} onOpenChange={setIsCollectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Sample</DialogTitle>
            <DialogDescription>
              Record sample collection for {selectedTest?.patientName} - {selectedTest?.testName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Sample Type</Label>
              <Select value={sampleData.sampleType} onValueChange={(v) => setSampleData({ ...sampleData, sampleType: v })}>
                <SelectTrigger><SelectValue placeholder="Select sample type" /></SelectTrigger>
                <SelectContent>
                  {sampleTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Collected By</Label>
              <Input 
                value={sampleData.collectedBy} 
                onChange={(e) => setSampleData({ ...sampleData, collectedBy: e.target.value })}
                placeholder="Enter technician name"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input 
                value={sampleData.notes} 
                onChange={(e) => setSampleData({ ...sampleData, notes: e.target.value })}
                placeholder="Any additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCollectOpen(false)}>Cancel</Button>
            <Button onClick={confirmCollection}>Confirm Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
