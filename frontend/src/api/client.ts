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

// Automatic JWT Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hrms_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request. Token may be expired.');
    }
    return Promise.reject(error);
  }
);
