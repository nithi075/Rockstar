// pages/Admin/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios"; // Assuming axios is configured globally with a baseURL

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0 });

  useEffect(() => {
    // CORRECTED: Use a relative URL, relying on Axios's global baseURL
    // This assumes your axios.defaults.baseURL is set to something like
    // 'https://admin-backend-x8of.onrender.com/api/v1' in production
    // or 'http://localhost:5000/api/v1' in development
    axios.get("/admin/dashboard")
      .then(res => {
        setStats(res.data.data);
      })
      .catch(error => {
        console.error("Error fetching dashboard stats:", error);
      });
  }, []);

  return (
    <div className="DashBoard">
      <h1 className="Admin-page">Admin Dashboard</h1>
      <div className="Admin-1">
        <div className="For-product">
          Total Products: {stats.totalProducts}
        </div>
        <div className="For-order">
          Total Orders: {stats.totalOrders}
        </div>
        <div className="For-User">
          Total Users: {stats.totalUsers}
        </div>
      </div>
    </div>
  );
}
