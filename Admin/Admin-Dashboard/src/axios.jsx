// src/axios.js
import axios from 'axios';

const api = axios.create({
  // CORRECTED: Use environment variables for the baseURL
  // This will dynamically set the base URL based on your environment
  // (e.g., development or production).
  baseURL: import.meta.env.VITE_BACKEND_API_URL || process.env.REACT_APP_BACKEND_API_URL,
  withCredentials: true, // Send cookies with every request
});

// Optional: Log the baseURL to the console during development to verify
// console.log("Axios instance baseURL:", api.defaults.baseURL);

export default api;
