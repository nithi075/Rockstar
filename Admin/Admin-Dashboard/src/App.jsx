// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
// No direct axios.defaults.baseURL here, as it's now set in src/axios.js
// We just need to import 'api' if we plan to use it directly in App.jsx for some reason,
// but for routing, it's not strictly necessary.

// Admin Components
import AdminNavbar from "./components/AdminNavbar";
import Dashboard from "./pages/Admin/Dashboard";
import ProductList from "./pages/Admin/ProductList";
import OrderList from "./pages/Admin/OrderList";
import EditProduct from "./pages/Admin/EditProduct";
import OrderDetails from "./pages/Admin/OrderDetails";
import AdminLoginPage from './pages/Admin/AdminLoginPage';
import CreateProduct from './pages/Admin/CreateProduct';
import './index.css';

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
        <Route path="/admin/products/new" element={<CreateProduct />} />
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
