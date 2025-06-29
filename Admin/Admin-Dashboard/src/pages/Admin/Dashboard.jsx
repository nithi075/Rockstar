// pages/Admin/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../axios"; // CORRECTED: Import your custom Axios instance

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null);    // Added error state

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        // CORRECTED: Use your custom 'api' instance
        // This will correctly make the request to 'https://admin-backend-x8of.onrender.com/api/v1/admin/dashboard'
        const res = await api.get("/admin/dashboard");
        setStats(res.data.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Provide more descriptive error messages
        setError("Failed to load dashboard stats. " + (error.response?.data?.message || error.message || "Please try again."));
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <div className="DashBoard">Loading dashboard stats...</div>;
  }

  if (error) {
    return <div className="DashBoard Error">Error: {error}</div>;
  }

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
