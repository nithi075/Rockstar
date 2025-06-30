// src/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://admin-backend-x8of.onrender.com/api/v1',
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("401 Unauthorized:", error.response.data.message);
      localStorage.removeItem('authToken');
      delete api.defaults.headers.common['Authorization'];
      // Use replace so user can't go back to protected page
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
