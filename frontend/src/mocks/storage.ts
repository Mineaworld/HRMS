import {
  INITIAL_USER,
  INITIAL_EMPLOYEES,
  INITIAL_DEPARTMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_PAYROLL,
  INITIAL_PENDING_ACTIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CRON_HISTORY,
  INITIAL_ATTENDANCE_CORRECTIONS,
} from './initialData';
import {
  Employee,
  Department,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  PendingAction,
  Announcement,
  UserAccount,
  JobExecution,
  AttendanceCorrection,
} from '../types';

const STORAGE_KEYS = {
  USER: 'hrms_user',
  EMPLOYEES: 'hrms_employees',
  DEPARTMENTS: 'hrms_departments',
  ATTENDANCE: 'hrms_attendance',
  LEAVES: 'hrms_leaves',
  PAYROLL: 'hrms_payroll',
  PENDING_ACTIONS: 'hrms_pending_actions',
  ANNOUNCEMENTS: 'hrms_announcements',
  CRON_HISTORY: 'hrms_cron_history',
  ATTENDANCE_CORRECTIONS: 'hrms_attendance_corrections',
};

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading key "${key}" from localStorage:`, e);
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key "${key}" to localStorage:`, e);
  }
};

export const getStoredData = () => {
  return {
    user: loadFromStorage<UserAccount>(STORAGE_KEYS.USER, INITIAL_USER),
    employees: loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES),
    departments: loadFromStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS),
    attendance: loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
    leaves: loadFromStorage<LeaveRequest[]>(STORAGE_KEYS.LEAVES, INITIAL_LEAVES),
    payroll: loadFromStorage<PayrollRecord[]>(STORAGE_KEYS.PAYROLL, INITIAL_PAYROLL),
    pendingActions: loadFromStorage<PendingAction[]>(STORAGE_KEYS.PENDING_ACTIONS, INITIAL_PENDING_ACTIONS),
    announcements: loadFromStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS),
    cronHistory: loadFromStorage<JobExecution[]>(STORAGE_KEYS.CRON_HISTORY, INITIAL_CRON_HISTORY),
    attendanceCorrections: loadFromStorage<AttendanceCorrection[]>(STORAGE_KEYS.ATTENDANCE_CORRECTIONS, INITIAL_ATTENDANCE_CORRECTIONS),
  };
};

export const resetAllStorage = () => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_LEAVES));
  localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL));
  localStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(INITIAL_PENDING_ACTIONS));
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  localStorage.setItem(STORAGE_KEYS.CRON_HISTORY, JSON.stringify(INITIAL_CRON_HISTORY));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE_CORRECTIONS, JSON.stringify(INITIAL_ATTENDANCE_CORRECTIONS));
};
