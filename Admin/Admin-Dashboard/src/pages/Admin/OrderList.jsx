import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios"; // custom axios instance that includes token
import { Loader } from "../../components/Loader";
import { Alert } from "../../components/Alert";

const backendURL = "https://admin-backend-x8of.onrender.com/api/v1";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get(`${backendURL}/orders`);
        setOrders(res.data.orders || []);
        setError("");
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please check authentication.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <Loader />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">All Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Image</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Size</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) =>
                order.cartItems.map((item, idx) => (
                  <tr key={order._id + idx}>
                    <td className="border p-2">
                      <img
                        src={`https://admin-backend-x8of.onrender.com/uploads/${item.product?.image}`}
                        alt={item.product?.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="border p-2">{item.product?.name}</td>
                    <td className="border p-2">{item.size}</td>
                    <td className="border p-2">{item.quantity}</td>
                    <td className="border p-2">₹{item.price}</td>
                    <td className="border p-2">{order.customerInfo?.name}</td>
                    <td className="border p-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border p-2">
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
      )}
    </div>
  );
}
