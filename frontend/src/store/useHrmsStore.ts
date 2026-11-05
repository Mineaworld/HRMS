import { create } from 'zustand';
import {
  Employee,
  Department,
  JobTitle,
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
import {
  employeeApi,
  departmentApi,
  jobApi,
  attendanceApi,
  leaveApi,
  payrollApi,
  cronApi,
  reportApi,
} from '../api';
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

export interface ActionResult<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

interface HrmsState {
  // Session & Authentication
  isAuthenticated: boolean;
  login: (user: UserAccount, token?: string) => void;
  logout: () => void;

  // Navigation & Role
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: UserAccount;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Gateway Connection & Telemetry State
  isLoading: boolean;
  isGatewayConnected: boolean;
  gatewayError: string | null;
  jobs: JobTitle[];
  cronHistory: any[];
  dashboardSummary: any | null;

  // Domain Collections (Clean Initial Empty Arrays)
  employees: Employee[];
  departments: Department[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payroll: PayrollRecord[];
  pendingActions: PendingAction[];
  announcements: Announcement[];
  attendanceCorrections: AttendanceCorrection[];

  // Gateway Synchronization
  syncWithGateway: () => Promise<void>;

  // Department Operations
  addDepartment: (dept: Omit<Department, 'departmentId' | 'headCount'>) => Promise<ActionResult<Department>>;
  updateDepartment: (id: number, dept: Partial<Department>) => Promise<ActionResult>;
  deleteDepartment: (id: number) => Promise<ActionResult>;

  // Cron Operations
  triggerCronJob: (jobName: string) => Promise<void>;

  // Attendance Correction Operations
  requestAttendanceCorrection: (req: Omit<AttendanceCorrection, 'correctionId' | 'status' | 'requestedAt'>) => Promise<ActionResult>;
  reviewAttendanceCorrection: (correctionId: number, status: 'APPROVED' | 'REJECTED') => Promise<ActionResult>;

  // Employee Operations
  addEmployee: (emp: Omit<Employee, 'employeeId'> | any) => Promise<ActionResult<Employee>>;
  updateEmployee: (id: number, emp: Partial<Employee> | any) => Promise<ActionResult<Employee>>;
  deleteEmployee: (id: number) => Promise<ActionResult>;

  // Attendance Operations
  checkInToday: (employeeId: number) => Promise<void>;
  checkOutToday: (employeeId: number) => Promise<void>;
  recordAttendancePunch: (type: 'IN' | 'OUT', note?: string) => Promise<ActionResult<AttendanceRecord>>;

  // Leave Operations
  submitLeaveRequest: (req: Omit<LeaveRequest, 'leaveId' | 'status' | 'appliedDate'> | any) => Promise<ActionResult<LeaveRequest>>;
  updateLeaveStatus: (leaveId: number, status: 'APPROVED' | 'REJECTED') => Promise<ActionResult>;
  cancelLeaveRequest: (leaveId: number) => Promise<ActionResult>;

  // Payroll Operations
  generateMonthlyPayroll: (periodMonth: string) => Promise<ActionResult>;
  markPayrollPaid: (recordId: number) => Promise<ActionResult>;
}

export const useHrmsStore = create<HrmsState>((set, get) => {
  // Restore authentication and user state from localStorage safely
  const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('hrms_authenticated') : null;
  const isAuthenticated = storedAuth === 'true';

  let initialUser: UserAccount = {
    accountId: 4,
    userName: 'sysadmin',
    email: 'sysadmin@hrms.local',
    role: 'ROLE_ADMIN',
    employeeId: undefined,
    fullName: 'System Administrator',
    avatarUrl: ROLE_PERSONAS.ROLE_ADMIN.avatarUrl,
  };
  try {
    if (typeof localStorage !== 'undefined') {
      const uStr = localStorage.getItem('hrms_user');
      if (uStr) {
        initialUser = JSON.parse(uStr);
      }
    }
  } catch {
    // Keep default admin persona fallback
  }

  return {
    // Session State
    isAuthenticated,
    login: (user, token) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hrms_user', JSON.stringify(user));
        localStorage.setItem('hrms_authenticated', 'true');
        if (token) {
          localStorage.setItem('hrms_jwt_token', token);
        }
      }
      set({ currentUser: user, isAuthenticated: true, activeTab: 'dashboard' });
      // Trigger instant background sync upon login
      get().syncWithGateway();
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hrms_authenticated', 'false');
        localStorage.removeItem('hrms_jwt_token');
        localStorage.removeItem('hrms_user');
      }
      set({
        isAuthenticated: false,
        activeTab: 'dashboard',
        employees: [],
        departments: [],
        jobs: [],
        attendance: [],
        leaves: [],
        payroll: [],
        cronHistory: [],
        dashboardSummary: null,
        pendingActions: [],
        announcements: [],
        gatewayError: null,
      });
    },

    // Navigation & Roles
    activeTab: 'dashboard',
    setActiveTab: (tab) => set({ activeTab: tab }),
    currentUser: initialUser,

    // Global Search Query
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),

    // Telemetry & Status Properties
    isLoading: false,
    isGatewayConnected: true,
    gatewayError: null,
    jobs: [],
    cronHistory: [],
    dashboardSummary: null,

    // Domain Collections (Clean Empty Initial State - Zero Mock Data)
    employees: [],
    departments: [],
    attendance: [],
    leaves: [],
    payroll: [],
    pendingActions: [],
    announcements: [],
    attendanceCorrections: [],

    // ==========================================
    // Gateway Synchronization Engine
    // ==========================================
    syncWithGateway: async () => {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('hrms_jwt_token') : null;
      const isAuth = get().isAuthenticated;

      if (!isAuth && !token) {
        set({ isLoading: false, isGatewayConnected: true, gatewayError: null });
        return;
      }

      set({ isLoading: true, gatewayError: null });

      try {
        const currentPeriod = new Date().toISOString().substring(0, 7);

        // Fetch live microservices data in parallel via Spring Cloud Gateway (:8080)
        const [
          empResult,
          deptResult,
          jobResult,
          attResult,
          leaveResult,
          payrollResult,
          cronResult,
          reportResult,
        ] = await Promise.allSettled([
          employeeApi.getAll(),
          departmentApi.getAll(),
          jobApi.getAll(),
          attendanceApi.getAll(),
          leaveApi.getAll(),
          payrollApi.getAll(currentPeriod),
          cronApi.getHistory(),
          reportApi.getDashboard(),
        ]);

        // If session token is expired or unauthorized, reset session to prompt fresh login
        const isUnauthorized = (res: PromiseSettledResult<any>) =>
          res.status === 'rejected' && res.reason?.response?.status === 401;

        if (isUnauthorized(empResult) || isUnauthorized(deptResult)) {
          console.warn('Session token expired or unauthorized. Redirecting to login screen.');
          get().logout();
          return;
        }

        // Evaluate connection failure / network errors
        const isNetworkFailure = (res: PromiseSettledResult<any>) =>
          res.status === 'rejected' &&
          (res.reason?.code === 'ERR_NETWORK' ||
            res.reason?.code === 'ECONNREFUSED' ||
            res.reason?.message?.includes('Network Error') ||
            res.reason?.response?.status === 502 ||
            res.reason?.response?.status === 503 ||
            res.reason?.response?.status === 504);

        if (isNetworkFailure(empResult) || isNetworkFailure(deptResult)) {
          const failureReason =
            empResult.status === 'rejected' ? empResult.reason : (deptResult as any).reason;
          const errMsg =
            failureReason?.response?.data?.message ||
            failureReason?.message ||
            'Unable to reach Spring Cloud Gateway at http://localhost:8080. Microservices may be offline.';

          set({
            isLoading: false,
            isGatewayConnected: false,
            gatewayError: errMsg,
          });
          return;
        }

        // 1. Process Live Employees
        let employees: Employee[] = [];
        if (empResult.status === 'fulfilled' && Array.isArray(empResult.value)) {
          employees = empResult.value.map((e: any) => ({
            employeeId: e.employeeId,
            firstName: e.firstName || '',
            lastName: e.lastName || '',
            email: e.email || '',
            phoneNumber: e.phoneNumber || '+855 12 345 678',
            gender: e.gender || 'Other',
            dob: e.dateOfBirth || e.dob || '1995-01-01',
            salary: Number(e.salary ?? 2500),
            departmentId: e.departmentId || 1,
            departmentName: e.departmentName || 'General',
            jobTitle: e.jobTitle || 'Staff',
            status:
              e.status === 'ACTIVE'
                ? 'Active'
                : e.status === 'ON_LEAVE'
                ? 'On Leave'
                : e.status === 'TERMINATED'
                ? 'Terminated'
                : (e.status || 'Active'),
            hireDate: e.hireDate || e.contractEndDate || new Date().toISOString().split('T')[0],
            avatarUrl:
              e.avatarUrl ||
              `https://images.unsplash.com/photo-${1534528741775 + (e.employeeId % 500)}?auto=format&fit=crop&w=200&q=80`,
          }));
        }

        // 2. Process Live Departments
        let departments: Department[] = [];
        if (deptResult.status === 'fulfilled' && Array.isArray(deptResult.value)) {
          departments = deptResult.value.map((d: any) => {
            const headCount = employees.filter((e) => e.departmentId === d.departmentId).length;
            const lead = employees.find((e) => e.departmentId === d.departmentId);
            return {
              departmentId: d.departmentId,
              departmentName: d.departmentName,
              description: d.description || '',
              headCount: d.headCount ?? headCount,
              leadEmployeeId: d.leadEmployeeId ?? lead?.employeeId,
              leadName: d.leadName ?? (lead ? `${lead.firstName} ${lead.lastName}` : 'Department Head'),
              leadAvatar: d.leadAvatar ?? lead?.avatarUrl,
              budget: d.budget ?? 150000,
            };
          });
        }

        // 3. Process Live Job Titles
        let jobs: JobTitle[] = [];
        if (jobResult.status === 'fulfilled' && Array.isArray(jobResult.value)) {
          jobs = jobResult.value;
        }

        // 4. Process Live Attendance Logs
        let attendance: AttendanceRecord[] = [];
        if (attResult.status === 'fulfilled' && Array.isArray(attResult.value)) {
          attendance = attResult.value.map((a: any) => {
            const emp = employees.find((e) => e.employeeId === a.employeeId);
            const formatTime = (t?: string) => {
              if (!t) return null;
              return t.includes('T') ? t.split('T')[1].substring(0, 5) : t.substring(0, 5);
            };
            return {
              attendanceId: a.attendanceId || Date.now(),
              employeeId: a.employeeId,
              employeeName:
                a.employeeName ||
                (emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${a.employeeId}`),
              attendanceDate: String(a.attendanceDate || new Date().toISOString().split('T')[0]),
              checkIn: formatTime(a.checkIn),
              checkOut: formatTime(a.checkOut),
              lateMinutes: a.lateMinutes || 0,
              otHours: a.otHours || 0,
              status: a.status || (a.lateMinutes > 0 ? 'LATE' : 'PRESENT'),
            };
          });
        }

        // 5. Process Live Leave Requests
        let leaves: LeaveRequest[] = [];
        if (leaveResult.status === 'fulfilled' && Array.isArray(leaveResult.value)) {
          leaves = leaveResult.value.map((l: any) => {
            let daysCount = l.daysCount;
            if (!daysCount && l.startDate && l.endDate) {
              const diff =
                Math.round(
                  (new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1;
              daysCount = Math.max(1, diff);
            }
            return {
              leaveId: l.leaveId,
              employeeId: l.employeeId,
              employeeName: l.employeeName || 'Staff Member',
              leaveType: l.leaveType || 'Casual Leave',
              startDate: l.startDate,
              endDate: l.endDate,
              daysCount: daysCount || 1,
              reason: l.reason || 'Leave requested',
              status: l.status || 'PENDING',
              approvedBy: l.approvedByName || l.approvedBy,
              appliedDate: l.appliedDate || l.startDate,
            };
          });
        }

        // 6. Process Live Payroll Records
        let payroll: PayrollRecord[] = [];
        if (payrollResult.status === 'fulfilled' && Array.isArray(payrollResult.value)) {
          payroll = payrollResult.value.map((p: any) => {
            const emp = employees.find((e) => e.employeeId === p.employeeId);
            return {
              recordId: p.payrollId || p.recordId || Date.now(),
              employeeId: p.employeeId,
              employeeName:
                p.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${p.employeeId}`),
              jobTitle: emp?.jobTitle || p.jobTitle || 'Staff',
              departmentName: emp?.departmentName || p.departmentName || 'General',
              periodMonth: String(p.period || p.periodMonth || currentPeriod),
              baseSalary: Number(p.baseSalary || 2500),
              allowances: Number(p.allowances || 200),
              lateDeductions: Number(p.lateDeduction || p.lateDeductions || 0),
              taxDeductions: Number(p.unpaidLeaveDeduction || p.taxDeductions || 0),
              netSalary: Number(p.netSalary || p.baseSalary || 2500),
              status: p.status || 'PROCESSED',
              paidDate: p.paidDate || p.generatedDate,
            };
          });
        }

        // 7. Process Live Cron Automation Telemetry
        let cronHistory: JobExecution[] = [];
        if (cronResult.status === 'fulfilled' && Array.isArray(cronResult.value)) {
          cronHistory = cronResult.value.map((c: any) => ({
            id: String(c.id),
            jobName: c.jobName,
            executionTime: c.startTime
              ? c.startTime.replace('T', ' ').substring(0, 19)
              : (c.executionTime || ''),
            status: c.status === 'COMPLETED' ? 'SUCCESS' : c.status,
            durationMs:
              c.durationMs ??
              (c.startTime && c.endTime
                ? Math.max(1, Math.round(new Date(c.endTime).getTime() - new Date(c.startTime).getTime()))
                : 0),
            message: c.errorMessage || c.message || `Job ${c.jobName} executed successfully`,
            triggeredBy: c.triggeredBy || 'CRON_SCHEDULER',
          }));
        }

        // 8. Process Live Dashboard Analytics Summary
        let dashboardSummary: any = null;
        if (reportResult.status === 'fulfilled') {
          dashboardSummary = reportResult.value?.data || reportResult.value;
        }

        // Derive Live Pending Action Tasks directly from PENDING leaves
        const pendingActions: PendingAction[] = leaves
          .filter((l) => l.status === 'PENDING')
          .map((l) => ({
            id: `leave-act-${l.leaveId}`,
            code: `HR-LV-${l.leaveId}`,
            title: `${l.leaveType} Request`,
            employeeName: l.employeeName,
            badgeText: 'PENDING APPROVAL',
            badgeType: 'warning' as const,
            lastUpdated: l.appliedDate || l.startDate,
            actionText: 'Review Leave',
          }));

        // Finalize state sync
        set({
          isLoading: false,
          isGatewayConnected: true,
          gatewayError: null,
          employees,
          departments,
          jobs,
          attendance,
          leaves,
          payroll,
          cronHistory,
          dashboardSummary,
          pendingActions,
          announcements: [],
        });
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          'Failed to synchronize with Spring Cloud Gateway (:8080)';
        set({
          isLoading: false,
          isGatewayConnected: false,
          gatewayError: errorMsg,
        });
      }
    },

    // ==========================================
    // Department Mutating Actions
    // ==========================================
    addDepartment: async (deptData) => {
      try {
        const res = await departmentApi.create({
          departmentName: deptData.departmentName,
          description: deptData.description,
        });
        const newDept: Department = {
          departmentId: res.departmentId,
          departmentName: res.departmentName,
          description: res.description,
          headCount: 0,
          leadEmployeeId: deptData.leadEmployeeId,
          leadName: deptData.leadName || 'Department Head',
          leadAvatar: deptData.leadAvatar,
          budget: deptData.budget || 150000,
        };
        set((state) => ({ departments: [...state.departments, newDept] }));
        return { success: true, data: newDept };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to create department on gateway.';
        console.error('addDepartment error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    updateDepartment: async (id, updates) => {
      try {
        await departmentApi.update(id, updates);
        set((state) => ({
          departments: state.departments.map((d) =>
            d.departmentId === id ? { ...d, ...updates } : d
          ),
        }));
        return { success: true };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to update department on gateway.';
        console.error('updateDepartment error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    deleteDepartment: async (id) => {
      const state = get();
      const hasEmployees = state.employees.some((e) => e.departmentId === id);
      if (hasEmployees) {
        return {
          success: false,
          error:
            'Cannot delete department with active assigned employees (DepartmentHasEmployeesException). Reassign staff first.',
        };
      }
      try {
        await departmentApi.delete(id);
        set((s) => ({ departments: s.departments.filter((d) => d.departmentId !== id) }));
        return { success: true };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to delete department from gateway.';
        console.error('deleteDepartment error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    // ==========================================
    // Cron Automations Actions
    // ==========================================
    triggerCronJob: async (jobName) => {
      try {
        await cronApi.triggerJob(jobName);
        const history = await cronApi.getHistory();
        if (Array.isArray(history)) {
          const formatted: JobExecution[] = history.map((c: any) => ({
            id: String(c.id),
            jobName: c.jobName,
            executionTime: c.startTime
              ? c.startTime.replace('T', ' ').substring(0, 19)
              : (c.executionTime || ''),
            status: c.status === 'COMPLETED' ? 'SUCCESS' : c.status,
            durationMs:
              c.durationMs ??
              (c.startTime && c.endTime
                ? Math.max(1, Math.round(new Date(c.endTime).getTime() - new Date(c.startTime).getTime()))
                : 0),
            message: c.errorMessage || c.message || `Job ${c.jobName} triggered successfully`,
            triggeredBy: c.triggeredBy || `MANUAL (${get().currentUser.userName})`,
          }));
          set({ cronHistory: formatted });
        }
      } catch (err: any) {
        console.error('triggerCronJob error:', err.message);
      }
    },

    // ==========================================
    // Attendance Corrections
    // ==========================================
    requestAttendanceCorrection: async (reqData) => {
      try {
        const res = await attendanceApi.requestCorrection(reqData.attendanceId, {
          checkIn: reqData.requestedCheckIn,
          checkOut: reqData.requestedCheckOut,
          reason: reqData.reason,
        });
        const newCorrection: AttendanceCorrection = {
          ...reqData,
          correctionId: Date.now(),
          status: 'PENDING',
          requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        set((state) => ({
          attendanceCorrections: [newCorrection, ...state.attendanceCorrections],
        }));
        return { success: true, data: res };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to submit punch correction request.';
        console.error('requestAttendanceCorrection error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    reviewAttendanceCorrection: async (correctionId, status) => {
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
        }

        return {
          attendanceCorrections: updatedCorrections,
          attendance: updatedAttendance,
        };
      });
      return { success: true };
    },

    // ==========================================
    // Employee Mutating Actions
    // ==========================================
    addEmployee: async (empData) => {
      try {
        const state = get();
        let jobId = empData.jobId;
        if (!jobId && empData.jobTitle) {
          const match = state.jobs.find(
            (j) => j.jobTitle.toLowerCase() === empData.jobTitle.toLowerCase()
          );
          if (match) jobId = match.jobId;
        }
        if (!jobId) {
          const deptJob = state.jobs.find((j) => j.departmentId === Number(empData.departmentId));
          jobId = deptJob ? deptJob.jobId : (state.jobs[0]?.jobId || 1);
        }

        const payload = {
          firstName: empData.firstName,
          lastName: empData.lastName,
          dateOfBirth: empData.dateOfBirth || empData.dob || '1995-01-01',
          email: empData.email,
          contractEndDate: empData.contractEndDate || '2028-12-31',
          departmentId: Number(empData.departmentId || 1),
          jobId: Number(jobId),
          jobChangeRemark: empData.jobChangeRemark || 'New employee registration',
        };

        const res = await employeeApi.create(payload);
        const dept = state.departments.find((d) => d.departmentId === Number(empData.departmentId));

        const newEmp: Employee = {
          employeeId: res.employeeId,
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email,
          phoneNumber: empData.phoneNumber || '+855 12 345 678',
          gender: empData.gender || 'Other',
          dob: res.dateOfBirth || empData.dob || '1995-01-01',
          salary: Number(empData.salary || 2500),
          departmentId: res.departmentId,
          departmentName: res.departmentName || dept?.departmentName || 'General',
          jobTitle: res.jobTitle || empData.jobTitle || 'Staff',
          status: (res.status === 'ACTIVE' ? 'Active' : (res.status || 'Active')) as any,
          hireDate: empData.hireDate || new Date().toISOString().split('T')[0],
          avatarUrl:
            empData.avatarUrl ||
            `https://images.unsplash.com/photo-${1534528741775 + (res.employeeId % 500)}?auto=format&fit=crop&w=200&q=80`,
        };

        set((s) => ({
          employees: [newEmp, ...s.employees],
        }));

        return { success: true, data: newEmp };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to register employee on gateway.';
        console.error('addEmployee error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    updateEmployee: async (id, updates) => {
      try {
        if (updates.status) {
          const backendStatus =
            updates.status === 'Active'
              ? 'ACTIVE'
              : updates.status === 'On Leave'
              ? 'ON_LEAVE'
              : updates.status === 'Terminated'
              ? 'TERMINATED'
              : updates.status;
          await employeeApi.updateStatus(id, backendStatus);
        }

        set((state) => ({
          employees: state.employees.map((e) => (e.employeeId === id ? { ...e, ...updates } : e)),
        }));

        return { success: true };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to update employee details on gateway.';
        console.error('updateEmployee error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    deleteEmployee: async (id) => {
      try {
        await employeeApi.updateStatus(id, 'TERMINATED');
        set((state) => ({
          employees: state.employees.filter((e) => e.employeeId !== id),
        }));
        return { success: true };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to terminate employee on gateway.';
        console.error('deleteEmployee error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    // ==========================================
    // Attendance Punch Mutating Actions
    // ==========================================
    recordAttendancePunch: async (type, note) => {
      try {
        let res: AttendanceRecord;
        if (type === 'IN') {
          res = await attendanceApi.checkIn(note);
        } else {
          res = await attendanceApi.checkOut(note);
        }

        // Refresh attendance logs
        try {
          const refreshed = await attendanceApi.getAll();
          if (Array.isArray(refreshed)) {
            const state = get();
            const formatted = refreshed.map((a: any) => {
              const emp = state.employees.find((e) => e.employeeId === a.employeeId);
              const formatTime = (t?: string) => {
                if (!t) return null;
                return t.includes('T') ? t.split('T')[1].substring(0, 5) : t.substring(0, 5);
              };
              return {
                attendanceId: a.attendanceId || Date.now(),
                employeeId: a.employeeId,
                employeeName:
                  a.employeeName ||
                  (emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${a.employeeId}`),
                attendanceDate: String(a.attendanceDate || new Date().toISOString().split('T')[0]),
                checkIn: formatTime(a.checkIn),
                checkOut: formatTime(a.checkOut),
                lateMinutes: a.lateMinutes || 0,
                otHours: a.otHours || 0,
                status: a.status || (a.lateMinutes > 0 ? 'LATE' : 'PRESENT'),
              };
            });
            set({ attendance: formatted });
          }
        } catch {
          // Keep response
        }

        return { success: true, data: res };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || `Failed to record attendance ${type}.`;
        console.error('recordAttendancePunch error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    checkInToday: async (employeeId) => {
      const result = await get().recordAttendancePunch('IN');
      if (!result.success) {
        // Fallback optimistic record for demo / local UI
        set((state) => {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = now.toISOString().split('T')[0];
          const hour = now.getHours();
          const minute = now.getMinutes();
          const cutoff = 8 * 60 + 15;
          const lateMinutes = hour * 60 + minute > cutoff ? hour * 60 + minute - cutoff : 0;
          const emp = state.employees.find((e) => e.employeeId === employeeId);
          const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
          const existing = state.attendance.find(
            (a) => a.employeeId === employeeId && a.attendanceDate === dateStr
          );
          let updated: AttendanceRecord[];
          if (existing) {
            updated = state.attendance.map((a) =>
              a.attendanceId === existing.attendanceId
                ? { ...a, checkIn: timeStr, lateMinutes, status: lateMinutes > 0 ? 'LATE' : 'PRESENT' }
                : a
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
          return { attendance: updated };
        });
      }
    },

    checkOutToday: async (employeeId) => {
      const result = await get().recordAttendancePunch('OUT');
      if (!result.success) {
        set((state) => {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = now.toISOString().split('T')[0];
          const hour = now.getHours();
          const minute = now.getMinutes();
          const ot = hour >= 17 ? Math.round(((hour - 17) + minute / 60) * 10) / 10 : 0;
          const updated = state.attendance.map((a) =>
            a.employeeId === employeeId && a.attendanceDate === dateStr
              ? { ...a, checkOut: timeStr, otHours: ot }
              : a
          );
          return { attendance: updated };
        });
      }
    },

    // ==========================================
    // Leave Mutating Actions
    // ==========================================
    submitLeaveRequest: async (reqData) => {
      try {
        const payload = {
          leaveType: reqData.leaveType,
          startDate: reqData.startDate,
          endDate: reqData.endDate,
          reason: reqData.reason || 'Leave requested',
        };

        const res = await leaveApi.apply(payload);

        let daysCount = reqData.daysCount;
        if (!daysCount && res.startDate && res.endDate) {
          daysCount =
            Math.round(
              (new Date(res.endDate).getTime() - new Date(res.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1;
        }

        const newLeave: LeaveRequest = {
          leaveId: res.leaveId,
          employeeId: res.employeeId || reqData.employeeId || 1,
          employeeName: res.employeeName || reqData.employeeName || 'Staff Member',
          leaveType: (res.leaveType || reqData.leaveType) as any,
          startDate: res.startDate || reqData.startDate,
          endDate: res.endDate || reqData.endDate,
          daysCount: daysCount || 1,
          reason: res.reason || reqData.reason || '',
          status: (res.status || 'PENDING') as any,
          appliedDate: new Date().toISOString().split('T')[0],
        };

        set((state) => ({
          leaves: [newLeave, ...state.leaves],
        }));

        return { success: true, data: newLeave };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to submit leave request to gateway.';
        console.error('submitLeaveRequest error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    updateLeaveStatus: async (leaveId, status) => {
      try {
        if (status === 'APPROVED') {
          await leaveApi.approve(leaveId);
        } else {
          await leaveApi.reject(leaveId, 'Decision processed by administrator');
        }

        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.leaveId === leaveId ? { ...l, status, approvedBy: state.currentUser.fullName } : l
          ),
        }));

        return { success: true };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || `Failed to ${status.toLowerCase()} leave request.`;
        console.error('updateLeaveStatus error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    cancelLeaveRequest: async (leaveId) => {
      try {
        await leaveApi.cancel(leaveId);
        set((state) => ({
          leaves: state.leaves.filter((l) => l.leaveId !== leaveId),
        }));
        return { success: true };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to cancel leave request.';
        console.error('cancelLeaveRequest error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    // ==========================================
    // Payroll Mutating Actions
    // ==========================================
    generateMonthlyPayroll: async (periodMonth) => {
      try {
        let ym = periodMonth;
        if (!/^\d{4}-\d{2}$/.test(periodMonth)) {
          const d = new Date(
            periodMonth.includes(' ')
              ? `${periodMonth.split(' ')[0]} 1, ${periodMonth.split(' ')[1]}`
              : periodMonth
          );
          if (!isNaN(d.getTime())) {
            ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          } else {
            ym = new Date().toISOString().substring(0, 7);
          }
        }

        await payrollApi.generateBatch(ym);

        const rawList = await payrollApi.getAll(ym);
        const state = get();
        const formatted: PayrollRecord[] = rawList.map((p: any) => {
          const emp = state.employees.find((e) => e.employeeId === p.employeeId);
          return {
            recordId: p.payrollId || p.recordId || Date.now(),
            employeeId: p.employeeId,
            employeeName:
              p.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${p.employeeId}`),
            jobTitle: emp?.jobTitle || p.jobTitle || 'Staff',
            departmentName: emp?.departmentName || p.departmentName || 'General',
            periodMonth: String(p.period || ym),
            baseSalary: Number(p.baseSalary || 2500),
            allowances: Number(p.allowances || 200),
            lateDeductions: Number(p.lateDeduction || p.lateDeductions || 0),
            taxDeductions: Number(p.unpaidLeaveDeduction || p.taxDeductions || 0),
            netSalary: Number(p.netSalary || p.baseSalary || 2500),
            status: p.status || 'PROCESSED',
            paidDate: p.paidDate || p.generatedDate,
          };
        });

        set({ payroll: formatted });
        return { success: true };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to generate monthly payroll batch.';
        console.error('generateMonthlyPayroll error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },

    markPayrollPaid: async (recordId) => {
      set((state) => ({
        payroll: state.payroll.map((p) =>
          p.recordId === recordId
            ? { ...p, status: 'PAID' as const, paidDate: new Date().toISOString().split('T')[0] }
            : p
        ),
      }));
      return { success: true };
    },
  };
});
