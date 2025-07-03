import { useEffect, useState } from "react";
import axios from "../../axios";
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/orders/admin/orders");
        setOrders(data.orders);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const markAsDelivered = async (orderId) => {
    try {
      setUpdatingOrderId(orderId);
      await axios.put(`/orders/${orderId}/deliver`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, isDelivered: true, deliveredAt: new Date().toISOString() }
            : order
        )
      );
    } catch (err) {
      alert("Failed to update delivery status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <div className="p-4">Loading orders...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-md shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">Order ID</th>
              <th className="py-2 px-4 border-b">Product</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Delivery Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const firstItem = order.cartItems[0];
              const product = firstItem?.product;
              return (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{order._id.slice(-6).toUpperCase()}</td>
                  <td className="py-2 px-4 border-b flex items-center gap-2">
                    <img
                      src={product?.image}
                      alt={product?.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span>{product?.name}</span>
                  </td>
                  <td className="py-2 px-4 border-b">₹{order.totalAmount}</td>
                  <td className="py-2 px-4 border-b">
                    {order.customerInfo?.name}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.isDelivered ? (
                      <span className="text-green-600">Delivered</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      Details
                    </Link>
                    {!order.isDelivered && (
                      <button
                        className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => markAsDelivered(order._id)}
                        disabled={updatingOrderId === order._id}
                      >
                        {updatingOrderId === order._id
                          ? "Updating..."
                          : "Mark Delivered"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
