 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { Search, Phone, Mail, Calendar, User, Eye } from 'lucide-react';
 import { useLocalStorage } from '@/hooks/useLocalStorage';
 import { mockPatients } from '@/lib/mockData';
 import { Patient } from '@/types';
 
 export function PatientSearch() {
   const navigate = useNavigate();
   const { data: patients } = useLocalStorage<Patient>('patients', mockPatients);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
   const [isViewOpen, setIsViewOpen] = useState(false);
 
   const filteredPatients = patients.filter(p =>
     p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.phone.includes(searchQuery) ||
     p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.id.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const handleView = (patient: Patient) => {
     setSelectedPatient(patient);
     setIsViewOpen(true);
   };
 
   const handleBookAppointment = (patientId: string) => {
     setIsViewOpen(false);
     navigate('/reception/appointments');
   };
 
   return (
     <div className="space-y-6">
       <div>
         <h2 className="text-2xl font-bold">Patient Search</h2>
         <p className="text-muted-foreground">Search and view existing patient records</p>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <CardTitle>Find Patient</CardTitle>
               <CardDescription>Search by name, phone, email, or patient ID</CardDescription>
             </div>
           </div>
         </CardHeader>
         <CardContent>
           <div className="relative mb-6">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input
               placeholder="Enter patient name, phone number, email, or ID..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 h-12 text-lg"
             />
           </div>
 
           {searchQuery ? (
             <>
               <p className="text-sm text-muted-foreground mb-4">
                 Found {filteredPatients.length} patient(s)
               </p>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Patient ID</TableHead>
                     <TableHead>Name</TableHead>
                     <TableHead>Phone</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Blood Group</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredPatients.map((patient) => (
                     <TableRow key={patient.id}>
                       <TableCell>
                         <Badge variant="outline">{patient.id.toUpperCase()}</Badge>
                       </TableCell>
                       <TableCell className="font-medium">{patient.name}</TableCell>
                       <TableCell>
                         <span className="flex items-center gap-1">
                           <Phone className="h-3 w-3 text-muted-foreground" />
                           {patient.phone}
                         </span>
                       </TableCell>
                       <TableCell>
                         <span className="flex items-center gap-1">
                           <Mail className="h-3 w-3 text-muted-foreground" />
                           {patient.email}
                         </span>
                       </TableCell>
                       <TableCell>
                         <Badge variant="secondary">{patient.bloodGroup}</Badge>
                       </TableCell>
                       <TableCell className="text-right">
                         <Button size="sm" variant="outline" onClick={() => handleView(patient)}>
                           <Eye className="h-4 w-4 mr-1" />
                           View
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                   {filteredPatients.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                         No patients found matching "{searchQuery}"
                       </TableCell>
                     </TableRow>
                   )}
                 </TableBody>
               </Table>
             </>
           ) : (
             <div className="text-center py-12 text-muted-foreground">
               <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
               <p className="text-lg">Start typing to search for patients</p>
               <p className="text-sm mt-2">You can search by name, phone number, email, or patient ID</p>
             </div>
           )}
         </CardContent>
       </Card>
 
       {/* View Patient Dialog */}
       <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
         <DialogContent className="sm:max-w-[600px]">
           <DialogHeader>
             <DialogTitle>Patient Details</DialogTitle>
             <DialogDescription>View patient information</DialogDescription>
           </DialogHeader>
           {selectedPatient && (
             <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                   <User className="h-8 w-8 text-primary" />
                 </div>
                 <div>
                   <h3 className="text-xl font-semibold">{selectedPatient.name}</h3>
                   <Badge variant="outline">{selectedPatient.id.toUpperCase()}</Badge>
                 </div>
               </div>
 
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <Label className="text-muted-foreground">Phone</Label>
                   <p className="flex items-center gap-2">
                     <Phone className="h-4 w-4" />
                     {selectedPatient.phone}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <Label className="text-muted-foreground">Email</Label>
                   <p className="flex items-center gap-2">
                     <Mail className="h-4 w-4" />
                     {selectedPatient.email}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <Label className="text-muted-foreground">Date of Birth</Label>
                   <p className="flex items-center gap-2">
                     <Calendar className="h-4 w-4" />
                     {selectedPatient.dateOfBirth}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <Label className="text-muted-foreground">Gender</Label>
                   <p className="capitalize">{selectedPatient.gender}</p>
                 </div>
                 <div className="space-y-1">
                   <Label className="text-muted-foreground">Blood Group</Label>
                   <Badge variant="secondary">{selectedPatient.bloodGroup}</Badge>
                 </div>
                 <div className="space-y-1">
                   <Label className="text-muted-foreground">Emergency Contact</Label>
                   <p>{selectedPatient.emergencyContact}</p>
                 </div>
               </div>
 
               <div className="space-y-1">
                 <Label className="text-muted-foreground">Address</Label>
                 <p>{selectedPatient.address}</p>
               </div>
 
               <div className="flex justify-end gap-2 pt-4 border-t">
                 <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                 <Button onClick={() => handleBookAppointment(selectedPatient.id)}>
                   <Calendar className="h-4 w-4 mr-2" />
                   Book Appointment
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
 }