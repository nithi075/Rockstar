// src/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://admin-backend-x8of.onrender.com/api/v1',
  withCredentials: true, // Send cookies with every request
});

export default api;
