import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, DollarSign, Clock, CheckCircle, AlertTriangle, Eye, Plus, Edit, Trash2 } from "lucide-react";
import { mockPatients, mockBills } from "@/lib/mockData";
import { Patient, Bill } from "@/types";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/crud/DeleteDialog";
import { useDatabaseCollection } from "@/hooks/useDatabaseCollection";

type BillingStatus = "paid" | "pending" | "overdue" | "partial";

const billingStatusColors: Record<BillingStatus, string> = {
  paid: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
  partial: "bg-blue-100 text-blue-800 border-blue-200",
};

const isOverdue = (billDate: string, status: string): boolean => {
  if (status === "paid") return false;
  const billDateObj = new Date(billDate);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - billDateObj.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff > 30;
};

const emptyPatientForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "male" as Patient["gender"],
  bloodGroup: "",
  address: "",
  emergencyContact: "",
};

export function PatientManagement() {
  const { data: patients, addItem: addPatient, updateItem: updatePatient, deleteItem: removePatient } =
    useDatabaseCollection<Patient>({
      collection: "patients",
      initialData: mockPatients,
    });
  const { data: bills, setData: setBills, updateItem: updateBill } = useDatabaseCollection<Bill>({
    collection: "bills",
    initialData: mockBills,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientBills, setSelectedPatientBills] = useState<Bill[]>([]);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isDeletePatientOpen, setIsDeletePatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);

  const patientsWithBilling = useMemo(
    () =>
      patients.map((patient) => {
        const patientBills = bills.filter((bill) => bill.patientId === patient.id);
        const totalAmount = patientBills.reduce((sum, bill) => sum + bill.total, 0);
        const paidAmount = patientBills.filter((bill) => bill.status === "paid").reduce((sum, bill) => sum + bill.total, 0);
        const pendingBills = patientBills.filter((bill) => bill.status === "pending" || bill.status === "partial");

        let billingStatus: BillingStatus = "paid";
        if (pendingBills.length > 0) {
          const hasOverdue = pendingBills.some((bill) => isOverdue(bill.date, bill.status));
          if (hasOverdue) {
            billingStatus = "overdue";
          } else if (patientBills.some((bill) => bill.status === "partial")) {
            billingStatus = "partial";
          } else {
            billingStatus = "pending";
          }
        }

        return {
          ...patient,
          totalAmount,
          paidAmount,
          dueAmount: totalAmount - paidAmount,
          billingStatus,
          billCount: patientBills.length,
        };
      }),
    [patients, bills]
  );

  const filteredPatients = patientsWithBilling.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || patient.billingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: patientsWithBilling.length,
    paid: patientsWithBilling.filter((patient) => patient.billingStatus === "paid").length,
    pending: patientsWithBilling.filter((patient) => patient.billingStatus === "pending").length,
    overdue: patientsWithBilling.filter((patient) => patient.billingStatus === "overdue").length,
    totalDue: patientsWithBilling.reduce((sum, patient) => sum + patient.dueAmount, 0),
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedPatientBills(bills.filter((bill) => bill.patientId === patient.id));
    setIsViewOpen(true);
  };

  const handleMarkAsPaid = async (billId: string) => {
    const bill = bills.find((currentBill) => currentBill.id === billId);
    if (!bill) return;

    await updateBill(billId, { status: "paid", paymentMethod: "Cash" });
    setSelectedPatientBills((prev) =>
      prev.map((currentBill) => (currentBill.id === billId ? { ...currentBill, status: "paid", paymentMethod: "Cash" } : currentBill))
    );
    toast.success("Bill marked as paid");
  };

  const openCreatePatient = () => {
    setEditingPatient(null);
    setPatientForm(emptyPatientForm);
    setIsPatientFormOpen(true);
  };

  const openEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setPatientForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
    });
    setIsPatientFormOpen(true);
  };

  const savePatient = async () => {
    if (!patientForm.name.trim() || !patientForm.email.trim() || !patientForm.phone.trim()) {
      toast.error("Name, email, and phone are required");
      return;
    }

    if (editingPatient) {
      await updatePatient(editingPatient.id, {
        ...patientForm,
      });
      toast.success("Patient updated successfully");
    } else {
      await addPatient({
        id: `patient-${Date.now()}`,
        name: patientForm.name.trim(),
        email: patientForm.email.trim().toLowerCase(),
        phone: patientForm.phone.trim(),
        dateOfBirth: patientForm.dateOfBirth || new Date().toISOString().split("T")[0],
        gender: patientForm.gender,
        bloodGroup: patientForm.bloodGroup.trim() || "N/A",
        address: patientForm.address.trim() || "N/A",
        emergencyContact: patientForm.emergencyContact.trim() || patientForm.phone.trim(),
        medicalHistory: [],
        createdAt: new Date().toISOString().split("T")[0],
      });
      toast.success("Patient created successfully");
    }

    setIsPatientFormOpen(false);
  };

  const requestDeletePatient = (patientId: string) => {
    setDeletePatientId(patientId);
    setIsDeletePatientOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!deletePatientId) return;

    await removePatient(deletePatientId);
    await setBills(bills.filter((bill) => bill.patientId !== deletePatientId));
    toast.success("Patient deleted successfully");
    setDeletePatientId(null);
    setIsDeletePatientOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Management</h2>
          <p className="text-muted-foreground">Manage patients and billing status.</p>
        </div>
        <Button onClick={openCreatePatient}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registered patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fully Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <p className="text-xs text-muted-foreground">No pending dues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {stats.totalDue > 0 && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">Total Outstanding Amount</p>
                <p className="text-2xl font-bold text-orange-900">Rs {stats.totalDue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Patient Billing Overview</CardTitle>
              <CardDescription>View and manage patient billing status</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-8 sm:w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Bills</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Due Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{patient.email}</p>
                      <p className="text-muted-foreground">{patient.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{patient.billCount}</TableCell>
                  <TableCell>Rs {patient.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className={patient.dueAmount > 0 ? "font-medium text-red-600" : ""}>
                    Rs {patient.dueAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${billingStatusColors[patient.billingStatus]} capitalize`}>{patient.billingStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewPatient(patient)}>
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditPatient(patient)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => requestDeletePatient(patient.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Bills - {selectedPatient?.name}</DialogTitle>
            <DialogDescription>View and manage bills for this patient</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPatientBills.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No bills found for this patient</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPatientBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-mono text-sm">{bill.id}</TableCell>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell>{bill.items.length} items</TableCell>
                      <TableCell>Rs {bill.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            billingStatusColors[(bill.status as BillingStatus) || "pending"] ?? billingStatusColors.pending
                          } capitalize`}
                        >
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bill.status !== "paid" && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(bill.id)}>
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPatientFormOpen} onOpenChange={setIsPatientFormOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Patient" : "Add Patient"}</DialogTitle>
            <DialogDescription>
              {editingPatient ? "Update patient registration details." : "Create a new patient profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={patientForm.name} onChange={(event) => setPatientForm({ ...patientForm, name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={patientForm.email}
                  onChange={(event) => setPatientForm({ ...patientForm, email: event.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={patientForm.phone} onChange={(event) => setPatientForm({ ...patientForm, phone: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={patientForm.dateOfBirth}
                  onChange={(event) => setPatientForm({ ...patientForm, dateOfBirth: event.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={patientForm.gender}
                  onValueChange={(value) => setPatientForm({ ...patientForm, gender: value as Patient["gender"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Input
                  value={patientForm.bloodGroup}
                  onChange={(event) => setPatientForm({ ...patientForm, bloodGroup: event.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={patientForm.address} onChange={(event) => setPatientForm({ ...patientForm, address: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input
                value={patientForm.emergencyContact}
                onChange={(event) => setPatientForm({ ...patientForm, emergencyContact: event.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPatientFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePatient}>{editingPatient ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={isDeletePatientOpen}
        onOpenChange={setIsDeletePatientOpen}
        onConfirm={confirmDeletePatient}
        title="Delete Patient"
        description="Are you sure you want to delete this patient and all linked billing records?"
      />
    </div>
  );
}

