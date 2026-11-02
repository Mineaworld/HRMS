import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';
export const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK !== 'false';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Automatic JWT & RBAC Gateway Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hrms_jwt_token') || 'mock-enterprise-jwt-token';
    config.headers.Authorization = `Bearer ${token}`;

    // Read stored user to inject Gateway RBAC headers
    try {
      const storedUser = localStorage.getItem('hrms_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role) {
          config.headers['X-User-Role'] = user.role;
        }
        if (user.employeeId) {
          config.headers['X-Employee-Id'] = String(user.employeeId);
        }
      }
    } catch (e) {
      // Ignore JSON parse error in mock mode
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler with RBAC clearance audit
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request to API Gateway (:8080). Token may be expired.');
    } else if (error.response?.status === 403) {
      console.warn('Access forbidden by Spring Cloud Gateway RBAC policy for endpoint:', error.config?.url);
    }
    return Promise.reject(error);
  }
);
