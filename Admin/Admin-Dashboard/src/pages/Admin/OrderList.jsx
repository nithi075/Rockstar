// pages/Admin/OrderList.jsx
import { useEffect, useState } from "react";
import api from "../../axios"; // Assuming this 'api' instance has a baseURL set (e.g., https://admin-backend-x8of.onrender.com)
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchOrders = async (page) => {
    try {
      // FIX: Changed the API endpoint path to match backend routing
      // If your 'api' (axios instance) has a baseURL like 'https://admin-backend-x8of.onrender.com/api/v1',
      // then change this to: `/orders/admin/orders`
      // If your 'api' has a baseURL like 'https://admin-backend-x8of.onrender.com/',
      // then change this to: `/api/v1/orders/admin/orders`
      // Based on your `app.js` and `routes/order.js`, the full path is '/api/v1/orders/admin/orders'
      // Determine your `api` (axios) baseURL to choose the correct one below.

      // Assuming your `api` (axios) baseURL is just the root (e.g., "https://admin-backend-x8of.onrender.com")
      const res = await api.get(`/api/v1/orders/admin/orders?page=${page}&limit=${limit}`, {
        withCredentials: true,
      });

      // If your `api` (axios) baseURL is "https://admin-backend-x8of.onrender.com/api/v1"
      // then use:
      // const res = await api.get(`/orders/admin/orders?page=${page}&limit=${limit}`, {
      //   withCredentials: true,
      // });

      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching orders:", err);
      // It's good practice to log the full error object to see network response
      console.error("Full error object:", err.response || err.message || err);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Order List</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Order ID</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-2">{order._id}</td>
                    <td className="px-4 py-2">{order.customerInfo?.name || "N/A"}</td>
                    <td className="px-4 py-2">₹{order.totalPrice}</td>
                    <td className="px-4 py-2">{order.status}</td>
                    <td className="px-4 py-2">
                      <Link to={`/admin/orders/${order._id}`} className="text-blue-500 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
