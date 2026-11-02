export type UserRole = 'ROLE_ADMIN' | 'ROLE_HR' | 'ROLE_EMPLOYEE';

export interface UserAccount {
  accountId: number;
  userName: string;
  email: string;
  role: UserRole;
  employeeId?: number;
  fullName: string;
  avatarUrl: string;
}

export interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  salary: number;
  departmentId: number;
  departmentName: string;
  jobTitle: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  hireDate: string;
  avatarUrl?: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
  description: string;
  headCount: number;
}

export interface AttendanceRecord {
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  otHours: number;
  status: 'PRESENT' | 'LATE' | 'ON_LEAVE' | 'ABSENT';
}

export interface LeaveRequest {
  leaveId: number;
  employeeId: number;
  employeeName: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Birthday / Anniv' | 'Optional Holiday' | 'Privilege Leave';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  appliedDate: string;
}

export interface PayrollRecord {
  recordId: number;
  employeeId: number;
  employeeName: string;
  jobTitle: string;
  departmentName: string;
  periodMonth: string; // e.g., "January 2026"
  baseSalary: number;
  allowances: number;
  lateDeductions: number;
  taxDeductions: number;
  netSalary: number;
  status: 'PAID' | 'PROCESSED' | 'PENDING';
  paidDate?: string;
}

export interface PendingAction {
  id: string;
  code: string; // e.g. "HR-APR-2026-00023"
  title: string;
  employeeName: string;
  badgeText: string;
  badgeType: 'success' | 'warning' | 'info';
  lastUpdated: string;
  actionText: string;
}

export interface Announcement {
  id: number;
  description: string;
  date: string;
  tag?: string;
}
