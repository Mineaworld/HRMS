import { create } from 'zustand';
import {
  Employee,
  Department,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  PendingAction,
  Announcement,
  UserAccount,
  UserRole,
  JobExecution,
  AttendanceCorrection,
} from '../types';
import { getStoredData, saveToStorage, resetAllStorage } from '../mocks/storage';
import { ROLE_PERSONAS, isRoleAllowedForTab } from '../utils/rbac';

export type NavTab =
  | 'dashboard'
  | 'attendance'
  | 'timesheet'
  | 'employees'
  | 'departments'
  | 'automations'
  | 'leaves'
  | 'payroll'
  | 'reports'
  | 'profile';

interface HrmsState {
  // Session & Authentication
  isAuthenticated: boolean;
  login: (user: UserAccount, token?: string) => void;
  logout: () => void;

  // Navigation & Role
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: UserAccount;
  setUserRole: (role: UserRole) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Domain Collections
  employees: Employee[];
  departments: Department[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payroll: PayrollRecord[];
  pendingActions: PendingAction[];
  announcements: Announcement[];
  cronHistory: JobExecution[];
  attendanceCorrections: AttendanceCorrection[];

  // Department Operations
  addDepartment: (dept: Omit<Department, 'departmentId' | 'headCount'>) => void;
  updateDepartment: (id: number, dept: Partial<Department>) => void;
  deleteDepartment: (id: number) => { success: boolean; error?: string };

  // Cron Operations
  triggerCronJob: (jobName: string) => void;

  // Attendance Correction Operations
  requestAttendanceCorrection: (req: Omit<AttendanceCorrection, 'correctionId' | 'status' | 'requestedAt'>) => void;
  reviewAttendanceCorrection: (correctionId: number, status: 'APPROVED' | 'REJECTED') => void;

  // Employee Operations
  addEmployee: (emp: Omit<Employee, 'employeeId'>) => void;
  updateEmployee: (id: number, emp: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;

  // Attendance Operations
  checkInToday: (employeeId: number) => void;
  checkOutToday: (employeeId: number) => void;

  // Leave Operations
  submitLeaveRequest: (req: Omit<LeaveRequest, 'leaveId' | 'status' | 'appliedDate'>) => void;
  updateLeaveStatus: (leaveId: number, status: 'APPROVED' | 'REJECTED') => void;
  cancelLeaveRequest: (leaveId: number) => void;

  // Payroll Operations
  generateMonthlyPayroll: (periodMonth: string) => void;
  markPayrollPaid: (recordId: number) => void;

  // Demo Reset
  resetDemoData: () => void;
}

export const useHrmsStore = create<HrmsState>((set, get) => {
  const initial = getStoredData();
  const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('hrms_authenticated') : null;
  const isAuthenticated = storedAuth === null ? true : storedAuth === 'true';

  return {
    isAuthenticated,
    login: (user, token) => {
      saveToStorage('hrms_user', user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hrms_authenticated', 'true');
        if (token) {
          localStorage.setItem('hrms_jwt_token', token);
        }
      }
      set({ currentUser: user, isAuthenticated: true, activeTab: 'dashboard' });
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hrms_authenticated', 'false');
        localStorage.removeItem('hrms_jwt_token');
      }
      set({ isAuthenticated: false, activeTab: 'dashboard' });
    },

    activeTab: 'dashboard',
    setActiveTab: (tab) => set({ activeTab: tab }),

    currentUser: initial.user,
    setUserRole: (role) => {
      set((state) => {
        const persona = ROLE_PERSONAS[role];
        const updatedUser: UserAccount = {
          ...state.currentUser,
          role,
          fullName: persona ? persona.fullName : state.currentUser.fullName,
          email: persona ? persona.email : state.currentUser.email,
          avatarUrl: persona ? persona.avatarUrl : state.currentUser.avatarUrl,
          employeeId: persona ? persona.employeeId : state.currentUser.employeeId,
        };
        saveToStorage('hrms_user', updatedUser);

        // Auto-redirect if tab is not permitted for the new role
        let nextTab = state.activeTab;
        if (!isRoleAllowedForTab(role, state.activeTab)) {
          nextTab = 'dashboard';
        }

        return { currentUser: updatedUser, activeTab: nextTab };
      });
    },

    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),

    employees: initial.employees,
    departments: initial.departments,
    attendance: initial.attendance,
    leaves: initial.leaves,
    payroll: initial.payroll,
    pendingActions: initial.pendingActions,
    announcements: initial.announcements,
    cronHistory: initial.cronHistory,
    attendanceCorrections: initial.attendanceCorrections,

    addDepartment: (deptData) => {
      set((state) => {
        const newId = Math.max(0, ...state.departments.map((d) => d.departmentId)) + 1;
        const lead = state.employees.find((e) => e.employeeId === deptData.leadEmployeeId);
        const newDept: Department = {
          ...deptData,
          departmentId: newId,
          headCount: 0,
          leadName: lead ? `${lead.firstName} ${lead.lastName}` : deptData.leadName,
          leadAvatar: lead ? lead.avatarUrl : deptData.leadAvatar,
        };
        const updated = [...state.departments, newDept];
        saveToStorage('hrms_departments', updated);
        return { departments: updated };
      });
    },

    updateDepartment: (id, updates) => {
      set((state) => {
        const updated = state.departments.map((d) => {
          if (d.departmentId === id) {
            const next = { ...d, ...updates };
            if (updates.leadEmployeeId) {
              const lead = state.employees.find((e) => e.employeeId === updates.leadEmployeeId);
              if (lead) {
                next.leadName = `${lead.firstName} ${lead.lastName}`;
                next.leadAvatar = lead.avatarUrl;
              }
            }
            return next;
          }
          return d;
        });
        saveToStorage('hrms_departments', updated);
        return { departments: updated };
      });
    },

    deleteDepartment: (id) => {
      const state = get();
      const hasEmployees = state.employees.some((e) => e.departmentId === id);
      if (hasEmployees) {
        return {
          success: false,
          error: 'Cannot delete department with active assigned employees (DepartmentHasEmployeesException). Reassign staff first.',
        };
      }
      const updated = state.departments.filter((d) => d.departmentId !== id);
      saveToStorage('hrms_departments', updated);
      set({ departments: updated });
      return { success: true };
    },

    triggerCronJob: (jobName) => {
      const now = new Date();
      const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
      let duration = Math.floor(Math.random() * 80) + 35;
      let msg = `Job ${jobName} triggered manually and finished successfully.`;

      // Cross-service reactive triggers
      if (jobName === 'MonthlyPayrollJob') {
        const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        get().generateMonthlyPayroll(currentMonth);
        msg = `Triggered monthly payroll batch for ${currentMonth}; processed records across all active personnel.`;
      } else if (jobName === 'DailyAttendanceSyncJob') {
        msg = `Synchronized daily attendance logs: 0 anomalous punches flagged.`;
      } else if (jobName === 'ContractExpiryJob') {
        msg = `Scanned contracts: 0 expiring within 30 days.`;
      } else if (jobName === 'WeeklyReportJob') {
        msg = `Compiled weekly cross-department summaries for report_service.`;
      }

      const newExecution: JobExecution = {
        id: `exec-${Date.now()}`,
        jobName,
        executionTime: timeStr,
        status: 'SUCCESS',
        durationMs: duration,
        message: msg,
        triggeredBy: `MANUAL (${get().currentUser.userName})`,
      };

      set((state) => {
        const updated = [newExecution, ...state.cronHistory];
        saveToStorage('hrms_cron_history', updated);
        return { cronHistory: updated };
      });
    },

    requestAttendanceCorrection: (reqData) => {
      set((state) => {
        const newId = Math.max(0, ...state.attendanceCorrections.map((c) => c.correctionId)) + 1;
        const newCorrection: AttendanceCorrection = {
          ...reqData,
          correctionId: newId,
          status: 'PENDING',
          requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        const updated = [newCorrection, ...state.attendanceCorrections];
        saveToStorage('hrms_attendance_corrections', updated);
        return { attendanceCorrections: updated };
      });
    },

    reviewAttendanceCorrection: (correctionId, status) => {
      set((state) => {
        const target = state.attendanceCorrections.find((c) => c.correctionId === correctionId);
        if (!target) return state;

        const updatedCorrections = state.attendanceCorrections.map((c) =>
          c.correctionId === correctionId
            ? {
                ...c,
                status,
                reviewedBy: state.currentUser.fullName,
                reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              }
            : c
        );
        saveToStorage('hrms_attendance_corrections', updatedCorrections);

        // If approved, overwrite the attendance record punch times!
        let updatedAttendance = state.attendance;
        if (status === 'APPROVED') {
          updatedAttendance = state.attendance.map((a) =>
            a.attendanceId === target.attendanceId
              ? {
                  ...a,
                  checkIn: target.requestedCheckIn,
                  checkOut: target.requestedCheckOut,
                  status: 'PRESENT' as const,
                  lateMinutes: 0,
                }
              : a
          );
          saveToStorage('hrms_attendance', updatedAttendance);
        }

        return {
          attendanceCorrections: updatedCorrections,
          attendance: updatedAttendance,
        };
      });
    },

    addEmployee: (empData) => {
      set((state) => {
        const newId = Math.max(0, ...state.employees.map((e) => e.employeeId)) + 1;
        const newEmp: Employee = { ...empData, employeeId: newId };
        const updated = [newEmp, ...state.employees];
        saveToStorage('hrms_employees', updated);
        return { employees: updated };
      });
    },

    updateEmployee: (id, updates) => {
      set((state) => {
        const updated = state.employees.map((e) => (e.employeeId === id ? { ...e, ...updates } : e));
        saveToStorage('hrms_employees', updated);
        return { employees: updated };
      });
    },

    deleteEmployee: (id) => {
      set((state) => {
        const updated = state.employees.filter((e) => e.employeeId !== id);
        saveToStorage('hrms_employees', updated);
        return { employees: updated };
      });
    },

    checkInToday: (employeeId) => {
      set((state) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toISOString().split('T')[0];

        // Calculate late minutes if after 08:15 AM
        const hour = now.getHours();
        const minute = now.getMinutes();
        const totalMinutes = hour * 60 + minute;
        const cutoff = 8 * 60 + 15; // 08:15 AM
        const lateMinutes = totalMinutes > cutoff ? totalMinutes - cutoff : 0;

        const emp = state.employees.find((e) => e.employeeId === employeeId);
        const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';

        const existingIndex = state.attendance.findIndex(
          (a) => a.employeeId === employeeId && a.attendanceDate === dateStr
        );

        let updated: AttendanceRecord[];
        if (existingIndex >= 0) {
          updated = state.attendance.map((a, i) =>
            i === existingIndex ? { ...a, checkIn: timeStr, lateMinutes, status: lateMinutes > 0 ? 'LATE' : 'PRESENT' } : a
          );
        } else {
          const newRec: AttendanceRecord = {
            attendanceId: Date.now(),
            employeeId,
            employeeName: empName,
            attendanceDate: dateStr,
            checkIn: timeStr,
            checkOut: null,
            lateMinutes,
            otHours: 0,
            status: lateMinutes > 0 ? 'LATE' : 'PRESENT',
          };
          updated = [newRec, ...state.attendance];
        }

        saveToStorage('hrms_attendance', updated);
        return { attendance: updated };
      });
    },

    checkOutToday: (employeeId) => {
      set((state) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toISOString().split('T')[0];

        const updated = state.attendance.map((a) => {
          if (a.employeeId === employeeId && a.attendanceDate === dateStr) {
            // calculate overtime if checkout after 17:00 (5 PM)
            const hour = now.getHours();
            const minute = now.getMinutes();
            const ot = hour >= 17 ? Math.round(((hour - 17) + minute / 60) * 10) / 10 : 0;
            return { ...a, checkOut: timeStr, otHours: ot };
          }
          return a;
        });

        saveToStorage('hrms_attendance', updated);
        return { attendance: updated };
      });
    },

    submitLeaveRequest: (reqData) => {
      set((state) => {
        const newLeave: LeaveRequest = {
          ...reqData,
          leaveId: Date.now(),
          status: 'PENDING',
          appliedDate: new Date().toISOString().split('T')[0],
        };
        const updated = [newLeave, ...state.leaves];
        saveToStorage('hrms_leaves', updated);
        return { leaves: updated };
      });
    },

    updateLeaveStatus: (leaveId, status) => {
      set((state) => {
        const approver = state.currentUser.fullName;
        const updated = state.leaves.map((l) =>
          l.leaveId === leaveId ? { ...l, status, approvedBy: approver } : l
        );
        saveToStorage('hrms_leaves', updated);
        return { leaves: updated };
      });
    },

    cancelLeaveRequest: (leaveId) => {
      set((state) => {
        const updated = state.leaves.filter((l) => l.leaveId !== leaveId);
        saveToStorage('hrms_leaves', updated);
        return { leaves: updated };
      });
    },

    generateMonthlyPayroll: (periodMonth) => {
      set((state) => {
        const newRecords: PayrollRecord[] = state.employees.map((emp) => {
          const base = emp.salary;
          const allowances = Math.round(base * 0.08);
          const tax = Math.round(base * 0.05);
          const late = emp.status === 'On Leave' ? 50 : 0;
          const net = base + allowances - tax - late;

          return {
            recordId: Date.now() + emp.employeeId,
            employeeId: emp.employeeId,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            jobTitle: emp.jobTitle,
            departmentName: emp.departmentName,
            periodMonth,
            baseSalary: base,
            allowances,
            lateDeductions: late,
            taxDeductions: tax,
            netSalary: net,
            status: 'PROCESSED',
          };
        });

        const updated = [...newRecords, ...state.payroll];
        saveToStorage('hrms_payroll', updated);
        return { payroll: updated };
      });
    },

    markPayrollPaid: (recordId) => {
      set((state) => {
        const updated = state.payroll.map((p) =>
          p.recordId === recordId
            ? { ...p, status: 'PAID' as const, paidDate: new Date().toISOString().split('T')[0] }
            : p
        );
        saveToStorage('hrms_payroll', updated);
        return { payroll: updated };
      });
    },

    resetDemoData: () => {
      resetAllStorage();
      const fresh = getStoredData();
      set({
        currentUser: fresh.user,
        employees: fresh.employees,
        departments: fresh.departments,
        attendance: fresh.attendance,
        leaves: fresh.leaves,
        payroll: fresh.payroll,
        pendingActions: fresh.pendingActions,
        announcements: fresh.announcements,
      });
    },
  };
});
