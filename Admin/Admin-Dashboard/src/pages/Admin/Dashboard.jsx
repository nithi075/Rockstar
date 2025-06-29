// pages/Admin/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../../axios"; // <--- THIS IS THE CORRECTED IMPORT PATH based on your file structure

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setError("Failed to load dashboard stats. " + (error.response?.data?.message || error.message || "Please try again."));
      } finally {
        setLoading(false);
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
