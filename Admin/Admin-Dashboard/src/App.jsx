// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import axios from 'axios';

// Admin Components
import AdminNavbar from "./components/AdminNavbar";
import Dashboard from "./pages/Admin/Dashboard";
import ProductList from "./pages/Admin/ProductList";
import OrderList from "./pages/Admin/OrderList";
import EditProduct from "./pages/Admin/EditProduct";
import OrderDetails from "./pages/Admin/OrderDetails";
import AdminLoginPage from './pages/Admin/AdminLoginPage';
import CreateProduct from './pages/Admin/CreateProduct'; // <--- IMPORT THE NEW COMPONENT HERE
import './index.css'

// --- GLOBAL AXIOS CONFIGURATION: START ---
axios.defaults.baseURL = 'http://localhost:5000/api/v1'; // Your backend API base URL
axios.defaults.withCredentials = true; // Crucial for sending httpOnly cookies across domains/ports
// --- GLOBAL AXIOS CONFIGURATION: END ---

function AppContent() {
  const location = useLocation();
  const showAdminNavbar = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <>
      {showAdminNavbar && <AdminNavbar />}
      <Routes>
        {/* Public Admin Login Route */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/products" element={<ProductList />} />
        <Route path="/admin/products/edit/:id" element={<EditProduct />} />
        {/* Replace the placeholder with the actual CreateProduct component */}
        <Route path="/admin/products/new" element={<CreateProduct />} /> {/* <--- UPDATED THIS LINE */}
        <Route path="/admin/orders" element={<OrderList />} />
        <Route path="/admin/orders/:orderId" element={<OrderDetails />} />

        {/* Default route for the root path (e.g., a public homepage) */}
        <Route
          path="/"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to the Main Application!</h1>
              <p className="text-lg text-gray-600 mb-8">Click below to access the Admin Dashboard.</p>
              <Link
                to="/admin/login"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Go to Admin Login
              </Link>
            </div>
          }
        />
        {/* Catch-all route for any unhandled paths */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">The page you are looking for does not exist.</p>
            <Link
              to="/"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Go to Home
            </Link>
          </div>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
