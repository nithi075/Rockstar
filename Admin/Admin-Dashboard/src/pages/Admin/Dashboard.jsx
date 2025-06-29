// pages/Admin/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../../src/axios"; // <--- IMPORTANT: Import your custom Axios instance 'api'

export default function Dashboard() {
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0 });

    useEffect(() => {
        // No need to manually retrieve the token or set headers here.
        // The request interceptor in 'src/axios.js' handles adding the Authorization header
        // based on the 'authToken' in localStorage for any request made with 'api'.
        api.get("/admin/dashboard") // <--- CRUCIAL: Use 'api.get' here, not just 'axios.get'
            .then(res => {
                // Assuming your backend sends the stats directly under res.data.data as per your controller
                setStats(res.data.data);
            })
            .catch(error => {
                console.error("Error fetching dashboard stats:", error);
                // The response interceptor in 'src/axios.js' will handle 401 redirection globally.
                // You can add more specific error handling here if needed, but the global interceptor is covering 401.
            });
    }, []); // Empty dependency array means this effect runs once after the initial render

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
