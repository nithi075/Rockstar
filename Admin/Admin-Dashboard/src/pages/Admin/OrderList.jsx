import { useEffect, useState } from "react";
import api from "../../axios"; // Your custom axios instance with baseURL: "https://admin-backend-x8of.onrender.com/api/v1"
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState("");     // For error messages
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [totalPages, setTotalPages] = useState(1);   // For pagination
  const limit = 10; // Number of orders per page

  const fetchOrders = async (page) => {
    setLoading(true); // Set loading to true when fetching starts
    setError("");     // Clear any previous errors
    try {
      // Corrected API endpoint path based on your backend routing and axios baseURL
      // Backend route: /api/v1/orders/admin/orders
      // Axios baseURL: /api/v1
      // So, the path here is: /orders/admin/orders
      const res = await api.get(`/orders/admin/orders?page=${page}&limit=${limit}`);

      setOrders(res.data.orders);
      // IMPORTANT: Your backend's `getAllOrders` (in orderController.js) currently
      // returns `orders` and `totalAmount`. For pagination to work correctly,
      // the backend needs to return `totalCount` or `totalPages` with the orders.
      // This line assumes your backend will eventually provide `totalPages` or `totalCount`.
      setTotalPages(res.data.totalPages || Math.ceil(res.data.totalCount / limit) || 1);

    } catch (err) {
      console.error("Error fetching orders:", err);
      // Log the full error object for detailed debugging (e.g., err.response)
      console.error("Full error object:", err.response || err.message || err);
      setError("Failed to load orders. Please try again."); // User-friendly error message
    } finally {
      setLoading(false); // Set loading to false once fetching is complete (success or error)
    }
  };

  useEffect(() => {
    fetchOrders(currentPage); // Fetch orders whenever currentPage changes
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

  if (loading) {
    return <div className="p-4 text-center text-lg font-medium">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 text-lg font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1> {/* Used h1 as in your first snippet */}

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders found.</p>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="w-full min-w-[700px] divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th> {/* Changed from Total Amount to Total Price to match backend */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order._id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.customerInfo?.name || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{order.totalPrice}</td> {/* Using totalPrice from backend */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.cartItems?.length || 0}</td> {/* Using cartItems.length */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.status}</td> {/* Using order.status */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <Link
                        to={`/admin/orders/${order._id}`} // Correct template literal for Link `to` prop
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && ( // Only show pagination if there's more than one page
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
