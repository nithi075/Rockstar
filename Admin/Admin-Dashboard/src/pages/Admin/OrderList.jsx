import { useEffect, useState } from "react";
import api from "../../axios"; // This 'api' instance's baseURL is "https://admin-backend-x8of.onrender.com/api/v1"
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchOrders = async (page) => {
    try {
      // CORRECTED LINE: The path is now `/orders/admin/orders`
      // because your `api` (Axios) baseURL already includes `/api/v1`.
      // Your backend's full route is `/api/v1/orders/admin/orders`.
      // So, you only need to provide the `/orders/admin/orders` part here.
      const res = await api.get(`/orders/admin/orders?page=${page}&limit=${limit}`, {
        withCredentials: true,
      });

      setOrders(res.data.orders);
      // Ensure your backend sends `totalPages` or `totalCount` so you can calculate `totalPages`
      setTotalPages(res.data.totalPages || Math.ceil(res.data.totalCount / limit));
    } catch (err) {
      console.error("Error fetching orders:", err);
      // Log the full error object for more details, especially err.response for server errors
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
