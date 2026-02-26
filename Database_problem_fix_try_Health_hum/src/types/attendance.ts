// Shared Staff Attendance types - used by both Reception (check-in) and Admin (management)

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'half-day';

export interface StaffAttendance {
  oddbodyId: string;
  oddbodyName: string;
  role: string;
  department?: string;
  status: AttendanceStatus;
  date: string;
  checkIn?: string;
  checkOut?: string;
}

export const STAFF_ATTENDANCE_KEY = 'staffAttendance';

export const attendanceStatusColors: Record<AttendanceStatus, string> = {
  present: 'bg-green-100 text-green-800 border-green-200',
  absent: 'bg-red-100 text-red-800 border-red-200',
  leave: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'half-day': 'bg-blue-100 text-blue-800 border-blue-200',
};

export const getTodayDate = () => new Date().toISOString().split('T')[0];

export const getCurrentTime = () => 
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
