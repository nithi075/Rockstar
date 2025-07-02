import { useEffect, useState } from "react";
import api from '../../axios'; // Ensure this path is correct for your project structure
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders/admin/orders")
      .then(res => {
        setOrders(res.data.orders);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch orders", err);
        setError("Failed to load orders");
        setLoading(false);
      });
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
            <th className="border px-4 py-2">Product Image</th> {/* New column for image */}
            <th className="border px-4 py-2">Customer</th>
            <th className="border px-4 py-2">Total Items</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td className="border px-4 py-2">
                {/* Display a truncated version of the _id or a customId if available */}
                {order.customId ? order.customId : order._id.substring(0, 10) + '...'}
              </td>
              <td className="border px-4 py-2 text-center">
                {order.cartItems && order.cartItems.length > 0 && order.cartItems[0].image && (
                  <img
                    src={order.cartItems[0].image.url.startsWith('http')
                        ? order.cartItems[0].image.url
                        : `https://admin-backend-x8of.onrender.com/uploads/${order.cartItems[0].image.url}`
                    }
                    alt={order.cartItems[0].name || "Ordered Product"}
                    className="w-16 h-16 object-cover mx-auto rounded" // Tailwind classes for small image
                  />
                )}
                {!order.cartItems || order.cartItems.length === 0 && (
                  <span className="text-gray-500">No Image</span>
                )}
              </td>
              <td className="border px-4 py-2">{order.user?.name || 'N/A'}</td> {/* Assuming order.user has a name */}
              <td className="border px-4 py-2">{order.cartItems.length}</td>
              <td className="border px-4 py-2">
                <Link to={`/admin/orders/${order._id}`} className="text-blue-600 underline">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
