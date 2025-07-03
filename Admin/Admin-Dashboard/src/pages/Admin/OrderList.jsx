import { useEffect, useState } from "react";
import axios from "../../axios";
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/admin/orders");
      setOrders(data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const markAsDelivered = async (orderId) => {
    try {
      setUpdating(orderId);
      await axios.put(`/admin/orders/${orderId}`, { status: "Delivered" });
      await fetchOrders();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    } finally {
      setUpdating("");
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
            <th className="border px-4 py-2">Image</th>
            <th className="border px-4 py-2">Customer</th>
            <th className="border px-4 py-2">Total</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Items</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const firstItem = order.orderItems?.[0];
            const imageFile = firstItem?.product?.images?.[0];
            const imageUrl = imageFile
              ? `http://localhost:5000/uploads/${imageFile}`
              : "https://via.placeholder.com/50";

            return (
              <tr key={order._id} className="border-t text-center">
                <td className="px-4 py-2">
                  <img
                    src={imageUrl}
                    alt="product"
                    className="w-12 h-12 object-cover mx-auto"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/50";
                    }}
                  />
                </td>
                <td className="px-4 py-2">{order.user?.name || "N/A"}</td>
                <td className="px-4 py-2">
                  ₹{order.totalPrice !== undefined ? order.totalPrice : "N/A"}
                </td>
                <td className="px-4 py-2">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2">{order.orderItems?.length || 0}</td>
                <td className="px-4 py-2">
                  {order.orderStatus === "Delivered" ? (
                    <span className="text-green-600 font-semibold">Delivered</span>
                  ) : (
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                      onClick={() => markAsDelivered(order._id)}
                      disabled={updating === order._id}
                    >
                      {updating === order._id ? "Updating..." : "Mark as Delivered"}
                    </button>
                  )}
                </td>
                <td className="px-4 py-2">
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="text-blue-600 underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
