// src/components/AdminNavbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminNavbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/admin/dashboard" className="text-xl font-bold">Admin Dashboard</Link>
        <div className="space-x-4">
          <Link to="/admin/products" className="hover:text-gray-300">Products</Link>
          <Link to="/admin/orders" className="hover:text-gray-300">Orders</Link>
          {/* Add more admin links here */}
          <Link to="/admin/login" className="hover:text-gray-300">Logout</Link> {/* Example Logout link */}
        </div>
      </div>
    </nav>
  );
}
