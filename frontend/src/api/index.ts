import { apiClient } from './client';

export const authApi = {
  login: async (credentials: { userName: string; userPwd: string }) => {
    const res = await apiClient.post('/api/auth/login', credentials);
    return res.data;
  },
  verifyOtp: async (payload: { userName: string; otpCode: string }) => {
    const res = await apiClient.post('/api/auth/verify-otp', payload);
    return res.data;
  },
  changePassword: async (payload: { userName: string; oldPassword: string; newPassword: string }) => {
    const res = await apiClient.put('/api/auth/change-password', payload);
    return res.data;
  },
};

export const employeeApi = {
  getAll: async () => {
    const res = await apiClient.get('/api/v1/employees');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get(`/api/v1/employees/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/api/v1/employees', data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await apiClient.put(`/api/v1/employees/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/api/v1/employees/${id}`);
    return res.data;
  },
};

export const attendanceApi = {
  getDailyLogs: async (date?: string) => {
    const res = await apiClient.get('/api/v1/attendance', { params: { date } });
    return res.data;
  },
  checkIn: async (employeeId: number) => {
    const res = await apiClient.post('/api/v1/attendance/check-in', { employeeId });
    return res.data;
  },
  checkOut: async (employeeId: number) => {
    const res = await apiClient.post('/api/v1/attendance/check-out', { employeeId });
    return res.data;
  },
  requestCorrection: async (data: any) => {
    const res = await apiClient.post('/api/v1/attendance/corrections', data);
    return res.data;
  },
};

export const leaveApi = {
  getAll: async () => {
    const res = await apiClient.get('/api/v1/leaves');
    return res.data;
  },
  submit: async (data: any) => {
    const res = await apiClient.post('/api/v1/leaves', data);
    return res.data;
  },
  updateStatus: async (leaveId: number, status: 'APPROVED' | 'REJECTED') => {
    const res = await apiClient.patch(`/api/v1/leaves/${leaveId}/status`, { status });
    return res.data;
  },
};

export const payrollApi = {
  getRecords: async (month?: string) => {
    const res = await apiClient.get('/api/v1/payrolls', { params: { month } });
    return res.data;
  },
  generateMonthly: async (month: string) => {
    const res = await apiClient.post('/api/v1/payrolls/generate', { month });
    return res.data;
  },
  getPayslip: async (recordId: number) => {
    const res = await apiClient.get(`/api/v1/payrolls/${recordId}/slip`);
    return res.data;
  },
};

export const reportApi = {
  getDashboardSummary: async () => {
    const res = await apiClient.get('/api/reports/dashboard');
    return res.data;
  },
  getAttendanceReport: async () => {
    const res = await apiClient.get('/api/reports/attendance');
    return res.data;
  },
  getDepartmentCosts: async () => {
    const res = await apiClient.get('/api/reports/department-costs');
    return res.data;
  },
};
