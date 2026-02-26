import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Edit, UserCheck, UserX, Clock, Calendar, LogIn, LogOut, Plus, Trash2 } from "lucide-react";
import { mockUsers } from "@/lib/mockData";
import { User } from "@/types";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/crud/DeleteDialog";
import { useDatabaseCollection } from "@/hooks/useDatabaseCollection";
import {
  StaffAttendance,
  AttendanceStatus,
  STAFF_ATTENDANCE_KEY,
  attendanceStatusColors,
  getTodayDate,
} from "@/types/attendance";

const staffRoles = ["doctor", "nurse", "receptionist", "pharmacy", "laboratory", "billing"] as const;

const getStaffIdForDate = (record: StaffAttendance) => `${record.oddbodyId}-${record.date}`;

export function StaffManagement() {
  const { data: users, addItem: addUser, updateItem: updateUser, deleteItem: removeUser } = useDatabaseCollection<User>({
    collection: "users",
    initialData: mockUsers,
  });
  const { data: attendance, setData: setAttendance } = useDatabaseCollection<StaffAttendance>({
    collection: STAFF_ATTENDANCE_KEY,
    initialData: [],
    idResolver: getStaffIdForDate,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>(getTodayDate());
  const [isEditAttendanceOpen, setIsEditAttendanceOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<StaffAttendance | null>(null);
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [isDeleteStaffOpen, setIsDeleteStaffOpen] = useState(false);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    role: "doctor" as User["role"],
    department: "",
    specialization: "",
    phone: "",
  });

  const staffMembers = users.filter((u) => staffRoles.includes(u.role as (typeof staffRoles)[number]));

  const getStaffAttendance = (staffId: string) => {
    return attendance.find((record) => record.oddbodyId === staffId && record.date === dateFilter);
  };

  const staffWithAttendance = staffMembers.map((staff) => ({
    ...staff,
    attendance: getStaffAttendance(staff.id) || null,
  }));

  const filteredStaff = staffWithAttendance.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "not-arrived") return matchesSearch && !staff.attendance;
    return matchesSearch && staff.attendance?.status === statusFilter;
  });

  const dateAttendance = attendance.filter((a) => a.date === dateFilter);
  const stats = {
    present: dateAttendance.filter((a) => a.status === "present").length,
    absent: dateAttendance.filter((a) => a.status === "absent").length,
    leave: dateAttendance.filter((a) => a.status === "leave").length,
    halfDay: dateAttendance.filter((a) => a.status === "half-day").length,
    checkedIn: dateAttendance.filter((a) => a.checkIn && !a.checkOut).length,
    checkedOut: dateAttendance.filter((a) => a.checkIn && a.checkOut).length,
    notArrived: staffMembers.length - dateAttendance.length,
  };

  const handleEditAttendance = (staff: (typeof staffWithAttendance)[0]) => {
    if (staff.attendance) {
      setEditingAttendance(staff.attendance);
    } else {
      setEditingAttendance({
        oddbodyId: staff.id,
        oddbodyName: staff.name,
        role: staff.role,
        department: staff.department,
        status: "absent",
        date: dateFilter,
      });
    }
    setIsEditAttendanceOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!editingAttendance) return;

    const existingIndex = attendance.findIndex(
      (record) => record.oddbodyId === editingAttendance.oddbodyId && record.date === editingAttendance.date
    );

    if (existingIndex >= 0) {
      const updated = [...attendance];
      updated[existingIndex] = editingAttendance;
      await setAttendance(updated);
    } else {
      await setAttendance([...attendance, editingAttendance]);
    }

    toast.success("Attendance updated successfully");
    setIsEditAttendanceOpen(false);
    setEditingAttendance(null);
  };

  const openAddStaffForm = () => {
    setEditingStaff(null);
    setStaffForm({
      name: "",
      email: "",
      role: "doctor",
      department: "",
      specialization: "",
      phone: "",
    });
    setIsStaffFormOpen(true);
  };

  const openEditStaffForm = (staff: User) => {
    setEditingStaff(staff);
    setStaffForm({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.department ?? "",
      specialization: staff.specialization ?? "",
      phone: staff.phone ?? "",
    });
    setIsStaffFormOpen(true);
  };

  const saveStaff = async () => {
    if (!staffForm.name.trim() || !staffForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (editingStaff) {
      await updateUser(editingStaff.id, {
        ...staffForm,
      });
      toast.success("Staff updated successfully");
    } else {
      await addUser({
        id: `staff-${Date.now()}`,
        name: staffForm.name.trim(),
        email: staffForm.email.trim().toLowerCase(),
        role: staffForm.role,
        department: staffForm.department.trim() || undefined,
        specialization: staffForm.specialization.trim() || undefined,
        phone: staffForm.phone.trim() || undefined,
        createdAt: new Date().toISOString().split("T")[0],
      });
      toast.success("Staff created successfully");
    }

    setIsStaffFormOpen(false);
  };

  const requestDeleteStaff = (staffId: string) => {
    setDeletingStaffId(staffId);
    setIsDeleteStaffOpen(true);
  };

  const confirmDeleteStaff = async () => {
    if (!deletingStaffId) return;

    await removeUser(deletingStaffId);
    await setAttendance(attendance.filter((record) => record.oddbodyId !== deletingStaffId));
    toast.success("Staff deleted successfully");
    setIsDeleteStaffOpen(false);
    setDeletingStaffId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Attendance Management</h2>
          <p className="text-muted-foreground">Manage staff profiles and daily attendance.</p>
        </div>
        <Button onClick={openAddStaffForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <LogIn className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.checkedIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
            <LogOut className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.checkedOut}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.leave}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Half Day</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.halfDay}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Not Arrived</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.notArrived}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Staff Attendance Records</CardTitle>
              <CardDescription>Attendance for {dateFilter === getTodayDate() ? "Today" : dateFilter}</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="w-full sm:w-[180px]"
              />
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
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
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="leave">On Leave</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                  <SelectItem value="not-arrived">Not Arrived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No staff records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{staff.department || "-"}</TableCell>
                    <TableCell>
                      {staff.attendance ? (
                        <Badge className={`${attendanceStatusColors[staff.attendance.status]} capitalize`}>
                          {staff.attendance.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not arrived
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {staff.attendance?.checkIn ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Clock className="h-3 w-3" />
                          {staff.attendance.checkIn}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {staff.attendance?.checkOut ? (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Clock className="h-3 w-3" />
                          {staff.attendance.checkOut}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditAttendance(staff)} title="Edit attendance">
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditStaffForm(staff)} title="Edit staff">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => requestDeleteStaff(staff.id)} title="Delete staff">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditAttendanceOpen} onOpenChange={setIsEditAttendanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Attendance</DialogTitle>
            <DialogDescription>
              Update attendance status for {editingAttendance?.oddbodyName} on {editingAttendance?.date}
            </DialogDescription>
          </DialogHeader>
          {editingAttendance && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingAttendance.status}
                  onValueChange={(value) => setEditingAttendance({ ...editingAttendance, status: value as AttendanceStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="leave">On Leave</SelectItem>
                    <SelectItem value="half-day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(editingAttendance.status === "present" || editingAttendance.status === "half-day") && (
                <>
                  <div className="space-y-2">
                    <Label>Check In Time</Label>
                    <Input
                      type="time"
                      value={editingAttendance.checkIn || ""}
                      onChange={(event) => setEditingAttendance({ ...editingAttendance, checkIn: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Check Out Time</Label>
                    <Input
                      type="time"
                      value={editingAttendance.checkOut || ""}
                      onChange={(event) => setEditingAttendance({ ...editingAttendance, checkOut: event.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAttendanceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAttendance}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStaffFormOpen} onOpenChange={setIsStaffFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff" : "Add Staff"}</DialogTitle>
            <DialogDescription>{editingStaff ? "Update staff profile details." : "Create a new staff profile."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={staffForm.name} onChange={(event) => setStaffForm({ ...staffForm, name: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={staffForm.email}
                onChange={(event) => setStaffForm({ ...staffForm, email: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={staffForm.role} onValueChange={(value) => setStaffForm({ ...staffForm, role: value as User["role"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Department</Label>
              <Input value={staffForm.department} onChange={(event) => setStaffForm({ ...staffForm, department: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Specialization</Label>
              <Input
                value={staffForm.specialization}
                onChange={(event) => setStaffForm({ ...staffForm, specialization: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={staffForm.phone} onChange={(event) => setStaffForm({ ...staffForm, phone: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStaffFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveStaff}>{editingStaff ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={isDeleteStaffOpen}
        onOpenChange={setIsDeleteStaffOpen}
        onConfirm={confirmDeleteStaff}
        title="Delete Staff"
        description="Are you sure you want to delete this staff profile and related attendance records?"
      />
    </div>
  );
}
