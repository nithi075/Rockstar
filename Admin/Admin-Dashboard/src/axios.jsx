// src/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://admin-backend-x8of.onrender.com/api/v1',
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Retrieve token from storage

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (for handling 401 errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized response detected. Clearing token and redirecting to login.");
      localStorage.removeItem('authToken'); // Clear the expired/invalid token
      delete api.defaults.headers.common['Authorization']; // Clear header from axios instance
      // Redirect to login page
      // You might need to adjust this depending on your router (e.g., history.push('/login'))
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
