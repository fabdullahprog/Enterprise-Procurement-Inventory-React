// src/api/axiosInstance.ts
import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'http://localhost:5186';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  // Long-running requests (e.g., loading lots of products/categories)
  // Some environments/proxies may terminate long requests earlier, so
  // we set a large client-side timeout as well.
  timeout: 30 * 60 * 1000, // 30 minutes
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- Request Interceptor ----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor ----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
