import { useEffect, useState } from "react";
import axios from "../../axios";
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
      const { data } = await axios.get(`/admin/orders?page=${page}&limit=10`);
      setOrders(data.orders);
      setTotalPages(data.totalPages || Math.ceil(data.totalCount / 10));
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const markAsDelivered = async (orderId) => {
    try {
      await axios.put(`/admin/orders/${orderId}/deliver`);
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, isDelivered: true } : o)
      );
    } catch (err) {
      console.error("Failed to mark as delivered:", err);
      alert("Error updating delivery status");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading orders...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-2">Image</th>
            <th className="border px-2 py-2">Order ID</th>
            <th className="border px-2 py-2">Customer</th>
            <th className="border px-2 py-2">Amount</th>
            <th className="border px-2 py-2">Date</th>
            <th className="border px-2 py-2">Items</th>
            <th className="border px-2 py-2">Status</th>
            <th className="border px-2 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id} className="border-t">
              <td className="px-2 py-2 text-center">
                <img
                  src={
                    order.cartItems[0]?.product?.images?.[0]?.url ||
                    "https://via.placeholder.com/50"
                  }
                  alt="product"
                  className="w-12 h-12 object-cover mx-auto"
                />
              </td>
              <td className="px-2 py-2">{order._id}</td>
              <td className="px-2 py-2">{order.customerInfo?.name || "N/A"}</td>
              <td className="px-2 py-2">₹{order.totalAmount}</td>
              <td className="px-2 py-2">
                {new Date(order.createdAt).toLocaleString()}
              </td>
              <td className="px-2 py-2 text-center">{order.cartItems.length}</td>
              <td className="px-2 py-2 text-center">
                {order.isDelivered ? (
                  <span className="text-green-600 font-semibold">Delivered</span>
                ) : (
                  <button
                    onClick={() => markAsDelivered(order._id)}
                    className="bg-blue-500 text-white px-2 py-1 text-xs rounded"
                  >
                    Mark as Delivered
                  </button>
                )}
              </td>
              <td className="px-2 py-2">
                <Link
                  to={`/admin/orders/${order._id}`}
                  className="text-blue-600 underline text-sm"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-center items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1 ? "bg-black text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
