// src/pages/Admin/OrderList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios";

const BACKEND_IMAGE_URL = "https://admin-backend-x8of.onrender.com/uploads";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/orders?page=${page}`);
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages || 1);
        setError("");
      } catch (err) {
        setError("Error fetching orders");
        console.error("Error fetching orders: ", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Orders</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Size</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) =>
                order.cartItems.map((item, idx) => {
                  const imageName = item.product?.images?.[0]?.url || "placeholder.jpg";
                  const imageUrl = `${BACKEND_IMAGE_URL}/Products/${imageName}`;
                  return (
                    <tr key={order._id + idx} className="border-t">
                      <td className="px-4 py-2">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2">{item.size}</td>
                      <td className="px-4 py-2">₹{item.price * item.quantity}</td>
                      <td className="px-4 py-2">{order.status || "Pending"}</td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-blue-500 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
