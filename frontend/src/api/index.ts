import { apiClient } from './client';

export const authApi = {
  login: async (credentials: { userName: string; password?: string; userPwd?: string }) => {
    const payload = {
      userName: credentials.userName,
      password: credentials.password || credentials.userPwd || '',
    };
    const res = await apiClient.post('/api/auth/login', payload);
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
  resetPassword: async (payload: { userName: string; newPassword: string }) => {
    const res = await apiClient.put('/api/auth/reset-password', payload);
    return res.data;
  },
};

export const employeeApi = {
  getAll: async () => {
    const res = await apiClient.get('/api/employees');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get(`/api/employees/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/api/employees', data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await apiClient.patch(`/api/employees/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: number, status: string) => {
    const res = await apiClient.patch(`/api/employees/${id}/status`, { status });
    return res.data;
  },
};

export const attendanceApi = {
  getDailyLogs: async (date?: string) => {
    const res = await apiClient.get('/api/attendance', { params: { date } });
    return res.data;
  },
  getMyAttendance: async (date?: string) => {
    const res = await apiClient.get('/api/attendance/me', { params: { date } });
    return res.data;
  },
  checkIn: async () => {
    const res = await apiClient.post('/api/attendance/check-in');
    return res.data;
  },
  checkOut: async () => {
    const res = await apiClient.post('/api/attendance/check-out');
    return res.data;
  },
  requestCorrection: async (data: any) => {
    const res = await apiClient.post('/api/attendance/corrections', data);
    return res.data;
  },
};

export const leaveApi = {
  getAll: async () => {
    const res = await apiClient.get('/api/leaves');
    return res.data;
  },
  getMyLeaves: async () => {
    const res = await apiClient.get('/api/leaves/me');
    return res.data;
  },
  submit: async (data: any) => {
    const res = await apiClient.post('/api/leaves', data);
    return res.data;
  },
  approve: async (leaveId: number) => {
    const res = await apiClient.patch(`/api/leaves/${leaveId}/approve`);
    return res.data;
  },
  reject: async (leaveId: number) => {
    const res = await apiClient.patch(`/api/leaves/${leaveId}/reject`);
    return res.data;
  },
  cancel: async (leaveId: number) => {
    const res = await apiClient.patch(`/api/leaves/${leaveId}/cancel`);
    return res.data;
  },
};

export const payrollApi = {
  getByPeriod: async (period: string) => {
    const res = await apiClient.get('/api/payroll', { params: { period } });
    return res.data;
  },
  getMyPayrolls: async () => {
    const res = await apiClient.get('/api/payroll/me');
    return res.data;
  },
  generateMonthly: async (period: string) => {
    const res = await apiClient.post('/api/payroll/generate', { period });
    return res.data;
  },
  setProfile: async (employeeId: number, data: any) => {
    const res = await apiClient.post(`/api/payroll/profiles/${employeeId}`, data);
    return res.data;
  },
  getProfile: async (employeeId: number) => {
    const res = await apiClient.get(`/api/payroll/profiles/${employeeId}`);
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

export const departmentApi = {
  getAll: async () => {
    const res = await apiClient.get('/api/departments');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get(`/api/departments/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/api/departments', data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await apiClient.patch(`/api/departments/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/api/departments/${id}`);
    return res.data;
  },
};

export const cronApi = {
  getHistory: async () => {
    const res = await apiClient.get('/api/v1/jobs/history');
    return res.data;
  },
  triggerJob: async (jobName: string) => {
    const res = await apiClient.post(`/api/v1/jobs/${jobName}/trigger`);
    return res.data;
  },
};

export const attendanceCorrectionApi = {
  correct: async (attendanceId: number, data: any) => {
    const res = await apiClient.post(`/api/attendance/${attendanceId}/corrections`, data);
    return res.data;
  },
  getHistory: async (attendanceId: number) => {
    const res = await apiClient.get(`/api/attendance/${attendanceId}/corrections`);
    return res.data;
  },
};
