import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://admin-backend-x8of.onrender.com', // Your backend server
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
