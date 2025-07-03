import { useEffect, useState } from "react";
import axios from "../../axios";
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/orders/admin/orders", {
        withCredentials: true,
      });
      setOrders(data.orders);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId) => {
    try {
      await axios.put(
        `/api/v1/orders/admin/order/${orderId}`,
        { status: "Delivered" },
        { withCredentials: true }
      );
      fetchOrders(); // Refresh orders after update
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update status.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading orders...</div>;
  if (error) return <div className="text-red-600 text-center mt-8">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Order List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
              <th className="p-3">Order ID</th>
              <th className="p-3">Product</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-3">{order._id.slice(-6)}</td>
                <td className="p-3 flex items-center gap-2">
                  {order.cartItems?.[0]?.product?.image && (
                    <img
                      src={order.cartItems[0].product.image}
                      alt="product"
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <span>{order.cartItems?.[0]?.product?.name || "N/A"}</span>
                </td>
                <td className="p-3">{order.customerInfo?.name || "N/A"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      order.status === "Delivered"
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3">₹{order.totalAmount}</td>
                <td className="p-3 space-x-2">
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="text-blue-600 underline"
                  >
                    View
                  </Link>
                  {order.status !== "Delivered" && (
                    <button
                      onClick={() => handleStatusUpdate(order._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
