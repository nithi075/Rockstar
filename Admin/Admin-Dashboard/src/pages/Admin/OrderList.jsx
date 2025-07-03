import { useEffect, useState } from "react";
import api from "../../axios"; // Your custom axios instance
import { Link } from "react-router-dom";
import { toast } from "react-toastify"; // Assuming you have react-toastify setup for notifications

// Define your backend's base URL for static files (like images).
// Make sure this matches the domain where your backend is deployed and serving /uploads.
const BACKEND_BASE_URL = "https://admin-backend-x8of.onrender.com"; // <-- VERIFY THIS URL IS CORRECT

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // State to track which order is being updated
  const limit = 10;

  const fetchOrders = async (page) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/orders/admin/orders?page=${page}&limit=${limit}`);
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages || Math.ceil(res.data.totalCount / limit) || 1);
    } catch (err) {
      console.error("Error fetching orders:", err);
      console.error("Full error object:", err.response || err.message || err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDeliverOrder = async (orderId) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await api.put(`/admin/order/${orderId}`, { status: "Delivered" });

      if (res.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "Delivered" } : order
          )
        );
        toast.success("Order status updated to Delivered!");
      } else {
        toast.error(res.data.message || "Failed to update order status.");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      console.error("Full error object:", err.response || err.message || err);
      toast.error(err.response?.data?.message || "Error updating order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-lg font-medium">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 text-lg font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders found.</p>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="w-full min-w-[700px] divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  // Safely get the first product image URL
                  const productImageUrl = order.cartItems?.[0]?.product?.images?.[0]?.url;

                  // --- NEW LOGIC TO CORRECT IMAGE URL PATH ---
                  let correctedImageUrl = "";
                  if (productImageUrl) {
                    // Check if it already starts with /uploads/ (for future correct uploads)
                    if (productImageUrl.startsWith('/uploads/')) {
                      correctedImageUrl = productImageUrl;
                    } else if (productImageUrl.startsWith('Products/')) {
                      // If it starts with 'Products/', correct it to '/uploads/'
                      correctedImageUrl = productImageUrl.replace('Products/', '/uploads/');
                    } else {
                      // Fallback for other unexpected formats (e.g., just filename)
                      correctedImageUrl = `/uploads/${productImageUrl.split('/').pop()}`;
                    }
                  }
                  // --- END NEW LOGIC ---

                  return (
                    <tr key={order._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {correctedImageUrl ? (
                          <img
                            src={`${BACKEND_BASE_URL}${correctedImageUrl}`} // Use the corrected path
                            alt={order.cartItems?.[0]?.product?.name || "Product Image"}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.customerInfo?.name || "N/A"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.cartItems?.[0]?.product?.price || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${order.status === "Delivered" ? "bg-green-100 text-green-800" : ""}
                            ${order.status === "Processing" ? "bg-yellow-100 text-yellow-800" : ""}
                            ${order.status === "Shipped" ? "bg-blue-100 text-blue-800" : ""}
                            ${order.status === "Cancelled" ? "bg-red-1100 text-red-800" : ""}
                          `}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 space-x-2">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeliverOrder(order._id)}
                          disabled={order.status === "Delivered" || updatingOrderId === order._id}
                          className={`px-3 py-1 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-opacity-50
                            ${order.status === "Delivered" || updatingOrderId === order._id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                            }`}
                        >
                          {updatingOrderId === order._id ? "Delivering..." : "Delivered"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
