import { useEffect, useState } from "react";
import api from "../../axios";
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      // ✅ FIXED: path corrected (no duplicate /api/v1)
      const res = await api.get(`/admin/orders?page=${page}&limit=10`);
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order List</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Order ID</th>
                <th className="border px-4 py-2">Customer</th>
                <th className="border px-4 py-2">Items</th>
                <th className="border px-4 py-2">Total Amount</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="border px-4 py-2">{order._id.slice(-6)}</td>
                  <td className="border px-4 py-2">{order.customerInfo?.name}</td>
                  <td className="border px-4 py-2">{order.cartItems.length}</td>
                  <td className="border px-4 py-2">₹{order.totalAmount}</td>
                  <td className="border px-4 py-2">{order.orderStatus}</td>
                  <td className="border px-4 py-2">
                    <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">{currentPage} / {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
