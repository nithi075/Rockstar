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

        // --- DEBUGGING CONSOLE LOGS START ---
        console.log('AXIOS INTERCEPTOR DEBUG: Checking token...');
        console.log('AXIOS INTERCEPTOR DEBUG: Token from localStorage:', token ? 'FOUND (' + token.substring(0, 20) + '...)' : 'NOT FOUND');
        // --- DEBUGGING CONSOLE LOGS END ---

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // --- DEBUGGING CONSOLE LOGS START ---
            console.log('AXIOS INTERCEPTOR DEBUG: Authorization header set for request:', config.url);
            // --- DEBUGGING CONSOLE LOGS END ---
        } else {
            // --- DEBUGGING CONSOLE LOGS START ---
            console.log('AXIOS INTERCEPTOR DEBUG: NO TOKEN, Authorization header WILL NOT be set for request:', config.url);
            // --- DEBUGGING CONSOLE LOGS END ---
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
            console.error("Unauthorized response detected from backend:", error.response.data.message);
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
