import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../axios"; // ✅ Corrected import

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
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(
        `/api/v1/orders/admin/order/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      fetchOrders(); // Refresh orders after update
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Change Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) =>
              order.cartItems.map((item, index) => (
                <tr
                  key={`${order._id}-${index}`}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-2">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2">{item.product?.name}</td>
                  <td className="px-4 py-2">₹{item.price}</td>
                  <td className="px-4 py-2">{order.status}</td>
                  <td className="px-4 py-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order._id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
