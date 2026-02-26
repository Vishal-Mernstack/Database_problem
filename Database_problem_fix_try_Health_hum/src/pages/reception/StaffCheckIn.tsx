import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Clock, Calendar } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockUsers } from '@/lib/mockData';
import { User } from '@/types';
import { toast } from 'sonner';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { 
  StaffAttendance, 
  AttendanceStatus,
  STAFF_ATTENDANCE_KEY, 
  attendanceStatusColors, 
  getTodayDate, 
  getCurrentTime 
} from '@/types/attendance';

export function StaffCheckIn() {
  const { data: users } = useLocalStorage<User>('users', mockUsers);
  const { data: attendance, setData: setAttendance } = useLocalStorage<StaffAttendance>(STAFF_ATTENDANCE_KEY, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Form states
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('present');
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [checkOutTime, setCheckOutTime] = useState<string>('');
  const [editingRecord, setEditingRecord] = useState<StaffAttendance | null>(null);

  // Get staff members only (exclude admin and patient)
  const staffRoles = ['doctor', 'nurse', 'receptionist', 'pharmacy', 'laboratory', 'billing'];
  const staffMembers = users.filter(u => staffRoles.includes(u.role));

  // Get today's attendance records
  const todayAttendance = attendance.filter(a => a.date === getTodayDate());

  // Filter attendance by search and status
  const filteredAttendance = todayAttendance.filter(record => {
    const matchesSearch = record.oddbodyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && record.status === statusFilter;
  });

  // Get staff who haven't been marked yet
  const unmarkedStaff = staffMembers.filter(
    staff => !todayAttendance.some(a => a.oddbodyId === staff.id)
  );

  // Stats for today
  const stats = {
    present: todayAttendance.filter(a => a.status === 'present').length,
    absent: todayAttendance.filter(a => a.status === 'absent').length,
    leave: todayAttendance.filter(a => a.status === 'leave').length,
    halfDay: todayAttendance.filter(a => a.status === 'half-day').length,
    notMarked: staffMembers.length - todayAttendance.length,
  };

  const resetForm = () => {
    setSelectedStaffId('');
    setSelectedStatus('present');
    setCheckInTime('');
    setCheckOutTime('');
    setEditingRecord(null);
  };

  const openAddDialog = () => {
    resetForm();
    setCheckInTime(getCurrentTime());
    setIsAddOpen(true);
  };

  const openEditDialog = (record: StaffAttendance) => {
    setEditingRecord(record);
    setSelectedStatus(record.status);
    setCheckInTime(record.checkIn || '');
    setCheckOutTime(record.checkOut || '');
    setIsEditOpen(true);
  };

  const openDeleteDialog = (record: StaffAttendance) => {
    setEditingRecord(record);
    setIsDeleteOpen(true);
  };

  const handleAddAttendance = () => {
    if (!selectedStaffId) {
      toast.error('Please select a staff member');
      return;
    }

    const staff = staffMembers.find(s => s.id === selectedStaffId);
    if (!staff) return;

    // Check if already exists for today
    const existing = todayAttendance.find(a => a.oddbodyId === selectedStaffId);
    if (existing) {
      toast.error(`${staff.name} already has an attendance record for today`);
      return;
    }

    const newRecord: StaffAttendance = {
      oddbodyId: staff.id,
      oddbodyName: staff.name,
      role: staff.role,
      department: staff.department,
      status: selectedStatus,
      date: getTodayDate(),
      checkIn: (selectedStatus === 'present' || selectedStatus === 'half-day') ? (checkInTime || getCurrentTime()) : undefined,
      checkOut: checkOutTime || undefined,
    };

    setAttendance([...attendance, newRecord]);
    toast.success(`Attendance recorded for ${staff.name}`);
    setIsAddOpen(false);
    resetForm();
  };

  const handleUpdateAttendance = () => {
    if (!editingRecord) return;

    const updatedRecord: StaffAttendance = {
      ...editingRecord,
      status: selectedStatus,
      checkIn: (selectedStatus === 'present' || selectedStatus === 'half-day') ? checkInTime || undefined : undefined,
      checkOut: (selectedStatus === 'present' || selectedStatus === 'half-day') ? checkOutTime || undefined : undefined,
    };

    setAttendance(attendance.map(a => 
      a.oddbodyId === editingRecord.oddbodyId && a.date === editingRecord.date
        ? updatedRecord
        : a
    ));

    toast.success(`Attendance updated for ${editingRecord.oddbodyName}`);
    setIsEditOpen(false);
    resetForm();
  };

  const handleDeleteAttendance = () => {
    if (!editingRecord) return;

    setAttendance(attendance.filter(a => 
      !(a.oddbodyId === editingRecord.oddbodyId && a.date === editingRecord.date)
    ));

    toast.success(`Attendance record deleted for ${editingRecord.oddbodyName}`);
    setIsDeleteOpen(false);
    resetForm();
  };

  const handleQuickCheckOut = (record: StaffAttendance) => {
    if (record.checkOut) {
      toast.error(`${record.oddbodyName} has already checked out`);
      return;
    }

    setAttendance(attendance.map(a => 
      a.oddbodyId === record.oddbodyId && a.date === record.date
        ? { ...a, checkOut: getCurrentTime() }
        : a
    ));

    toast.success(`${record.oddbodyName} checked out at ${getCurrentTime()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Staff Attendance</h2>
        <p className="text-muted-foreground">Record and manage staff attendance for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
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
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.halfDay}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Not Marked</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.notMarked}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>{getTodayDate()} - Staff attendance records</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full sm:w-[200px]"
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
                </SelectContent>
              </Select>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Attendance
              </Button>
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
              {filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No attendance records found. Click "Add Attendance" to record staff attendance.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance.map((record) => (
                  <TableRow key={record.oddbodyId}>
                    <TableCell className="font-medium">{record.oddbodyName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{record.role}</Badge>
                    </TableCell>
                    <TableCell>{record.department || '-'}</TableCell>
                    <TableCell>
                      <Badge className={`${attendanceStatusColors[record.status]} capitalize`}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.checkIn ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Clock className="h-3 w-3" />
                          {record.checkIn}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {record.checkOut ? (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Clock className="h-3 w-3" />
                          {record.checkOut}
                        </span>
                      ) : (record.status === 'present' || record.status === 'half-day') ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs"
                          onClick={() => handleQuickCheckOut(record)}
                        >
                          Check Out
                        </Button>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(record)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Unmarked Staff Section */}
      {unmarkedStaff.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staff Not Yet Marked ({unmarkedStaff.length})</CardTitle>
            <CardDescription>These staff members don't have attendance records for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {unmarkedStaff.map((staff) => (
                <div 
                  key={staff.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{staff.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize text-xs">{staff.role}</Badge>
                      {staff.department && (
                        <span className="text-xs text-muted-foreground">{staff.department}</span>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedStaffId(staff.id);
                      setCheckInTime(getCurrentTime());
                      setSelectedStatus('present');
                      setIsAddOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Mark
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Attendance Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Attendance</DialogTitle>
            <DialogDescription>Record attendance for a staff member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {unmarkedStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as AttendanceStatus)}>
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
            {(selectedStatus === 'present' || selectedStatus === 'half-day') && (
              <>
                <div className="space-y-2">
                  <Label>Check In Time</Label>
                  <Input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check Out Time (Optional)</Label>
                  <Input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAttendance}>Add Attendance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>
              Update attendance for {editingRecord?.oddbodyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as AttendanceStatus)}>
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
            {(selectedStatus === 'present' || selectedStatus === 'half-day') && (
              <>
                <div className="space-y-2">
                  <Label>Check In Time</Label>
                  <Input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check Out Time</Label>
                  <Input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateAttendance}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteAttendance}
        title="Delete Attendance Record"
        description={`Are you sure you want to delete the attendance record for ${editingRecord?.oddbodyName}? This action cannot be undone.`}
      />
    </div>
  );
}
