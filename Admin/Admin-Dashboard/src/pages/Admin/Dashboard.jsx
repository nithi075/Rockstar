// pages/Admin/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0 });

  useEffect(() => {
    axios.get("/admin/dashboard") // Simplified URL, no need for full base URL
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