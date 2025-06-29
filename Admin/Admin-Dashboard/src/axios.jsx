// src/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://admin-backend-x8of.onrender.com/api/v1', // Your Render backend API base URL
  withCredentials: true, // Crucial for sending httpOnly cookies across domains/ports
});

export default api;
