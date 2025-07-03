import { useEffect, useState } from "react";
import axios from "../../axios"; // custom axios with baseURL and credentials
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/admin/orders");
        setOrders(data.orders); // make sure your backend responds with { orders: [...] }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading orders...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Order ID</th>
            <th className="border px-4 py-2">Customer</th>
            <th className="border px-4 py-2">Total Amount</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Items</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id} className="border-t">
              <td className="px-4 py-2">{order._id}</td>
              <td className="px-4 py-2">{order.customerInfo?.name || "N/A"}</td>
              <td className="px-4 py-2">₹{order.totalAmount}</td>
              <td className="px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2">{order.cartItems.length}</td>
              <td className="px-4 py-2">
                <Link
                  to={`/admin/orders/${order._id}`}
                  className="text-blue-600 underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
