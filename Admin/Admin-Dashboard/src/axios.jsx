// src/axios.js (with added console.logs)
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://admin-backend-x8of.onrender.com/api/v1',
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        console.log('AXIOS INTERCEPTOR DEBUG: Checking token...');
        console.log('AXIOS INTERCEPTOR DEBUG: Token from localStorage:', token ? 'FOUND (' + token.substring(0, 20) + '...)' : 'NOT FOUND');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('AXIOS INTERCEPTOR DEBUG: Authorization header set for request:', config.url);
        } else {
            console.log('AXIOS INTERCEPTOR DEBUG: NO TOKEN, Authorization header WILL NOT be set for request:', config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized response detected from backend:", error.response.data.message);
            localStorage.removeItem('authToken');
            delete api.defaults.headers.common['Authorization'];
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
