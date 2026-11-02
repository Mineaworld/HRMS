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
} from '../types';
import { getStoredData, saveToStorage, resetAllStorage } from '../mocks/storage';
import { ROLE_PERSONAS, isRoleAllowedForTab } from '../utils/rbac';

export type NavTab = 'dashboard' | 'attendance' | 'timesheet' | 'employees' | 'leaves' | 'payroll' | 'reports' | 'profile';

interface HrmsState {
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

  return {
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
