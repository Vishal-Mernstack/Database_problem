import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getData, mockPatients } from '@/lib/mockData';
import { toast } from 'sonner';
import { Plus, Search, FileText, Clock, User, Tag } from 'lucide-react';

interface NursingNote {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  nurseId: string;
  nurseName: string;
  category: 'assessment' | 'intervention' | 'observation' | 'education' | 'handoff';
  content: string;
  createdAt: string;
  shift: 'day' | 'evening' | 'night';
}

const initialNotes: NursingNote[] = [
  {
    id: 'note-1',
    patientId: 'p1',
    patientName: 'John Smith',
    bedNumber: 'A-101',
    nurseId: 'nurse-1',
    nurseName: 'Sarah Wilson',
    category: 'assessment',
    content: 'Patient alert and oriented x3. Vital signs stable. Lung sounds clear bilaterally. No edema noted. Patient reports pain level 3/10 at surgical site.',
    createdAt: '2024-03-15T08:30:00',
    shift: 'day',
  },
  {
    id: 'note-2',
    patientId: 'p2',
    patientName: 'Mary Johnson',
    bedNumber: 'A-102',
    nurseId: 'nurse-1',
    nurseName: 'Sarah Wilson',
    category: 'intervention',
    content: 'Administered insulin per sliding scale. Blood glucose was 245 mg/dL. Will recheck in 2 hours. Patient reminded about dietary restrictions.',
    createdAt: '2024-03-15T07:45:00',
    shift: 'day',
  },
  {
    id: 'note-3',
    patientId: 'p3',
    patientName: 'Robert Brown',
    bedNumber: 'B-201',
    nurseId: 'nurse-2',
    nurseName: 'Emily Davis',
    category: 'observation',
    content: 'Patient appears anxious about upcoming procedure. Provided reassurance and explained what to expect. Family member at bedside providing support.',
    createdAt: '2024-03-15T09:15:00',
    shift: 'day',
  },
  {
    id: 'note-4',
    patientId: 'p1',
    patientName: 'John Smith',
    bedNumber: 'A-101',
    nurseId: 'nurse-1',
    nurseName: 'Sarah Wilson',
    category: 'education',
    content: 'Educated patient on wound care at home, signs of infection to watch for, and medication schedule. Patient verbalized understanding and demonstrated proper technique.',
    createdAt: '2024-03-15T10:00:00',
    shift: 'day',
  },
  {
    id: 'note-5',
    patientId: 'p4',
    patientName: 'Emily Davis',
    bedNumber: 'B-202',
    nurseId: 'nurse-3',
    nurseName: 'Michael Chen',
    category: 'handoff',
    content: 'Day shift report: Patient stable, awaiting discharge pending final labs. IV site patent, no signs of infection. Pain well controlled with oral meds. Family notified of expected discharge time.',
    createdAt: '2024-03-14T19:00:00',
    shift: 'evening',
  },
];

export function NurseNotes() {
  const { data: notes, addItem } = useLocalStorage<NursingNote>('nursingNotes', initialNotes);
  const patients = getData('patients', mockPatients);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: '',
    bedNumber: '',
    category: 'assessment' as NursingNote['category'],
    content: '',
    shift: 'day' as NursingNote['shift'],
  });

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: NursingNote['category']) => {
    switch (category) {
      case 'assessment': return 'bg-blue-100 text-blue-800';
      case 'intervention': return 'bg-green-100 text-green-800';
      case 'observation': return 'bg-purple-100 text-purple-800';
      case 'education': return 'bg-orange-100 text-orange-800';
      case 'handoff': return 'bg-cyan-100 text-cyan-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    
    const newNote: NursingNote = {
      id: `note-${Date.now()}`,
      patientId: formData.patientId,
      patientName: patient?.name || 'Unknown',
      bedNumber: formData.bedNumber,
      nurseId: 'nurse-current',
      nurseName: 'Current Nurse',
      category: formData.category,
      content: formData.content,
      createdAt: new Date().toISOString(),
      shift: formData.shift,
    };
    
    addItem(newNote);
    toast.success('Nursing note added successfully');
    setIsFormOpen(false);
    setFormData({ patientId: '', bedNumber: '', category: 'assessment', content: '', shift: 'day' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Nursing Notes</h2>
          <p className="text-muted-foreground">Document patient care and observations</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="assessment">Assessment</SelectItem>
            <SelectItem value="intervention">Intervention</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="handoff">Handoff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <Card key={note.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{note.patientName}</CardTitle>
                    <CardDescription>Bed: {note.bedNumber}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(note.category)}>
                    <Tag className="h-3 w-3 mr-1" />
                    {note.category}
                  </Badge>
                  <Badge variant="outline">{note.shift} shift</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">{note.content}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(note.createdAt)}
                </span>
                <span>By: {note.nurseName}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredNotes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No nursing notes found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Note Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Nursing Note</DialogTitle>
            <DialogDescription>Document patient care observations and interventions</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={formData.patientId} onValueChange={(v) => setFormData({ ...formData, patientId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bed Number</Label>
                  <Input 
                    value={formData.bedNumber} 
                    onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                    placeholder="e.g., A-101"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as NursingNote['category'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="intervention">Intervention</SelectItem>
                      <SelectItem value="observation">Observation</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="handoff">Handoff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Shift</Label>
                  <Select value={formData.shift} onValueChange={(v) => setFormData({ ...formData, shift: v as NursingNote['shift'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day (7AM - 3PM)</SelectItem>
                      <SelectItem value="evening">Evening (3PM - 11PM)</SelectItem>
                      <SelectItem value="night">Night (11PM - 7AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Note Content</Label>
                <Textarea 
                  value={formData.content} 
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Document your observations, assessments, or interventions..."
                  className="min-h-[150px]"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save Note</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
