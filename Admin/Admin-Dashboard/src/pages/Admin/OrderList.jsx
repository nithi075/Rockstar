import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios"; // Assuming this is your configured axios instance

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/admin/orders");
        // Sort orders by creation date if a 'createdAt' field exists in your API response
        const sortedOrders = (res.data.orders || []).sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders: ", err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleMarkAsDelivered = async (orderId) => {
    // Confirmation dialog for better UX
    if (!window.confirm("Are you sure you want to mark this order as Delivered?")) {
      return;
    }

    try {
      // Assuming your backend has an endpoint to update order status, e.g., PUT /admin/orders/:id/status
      // You might need to adjust this endpoint based on your actual API.
      await api.put(`/admin/orders/${orderId}/status`, { orderStatus: 'Delivered' });

      // Update the local state to reflect the change
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, orderStatus: 'Delivered' } : order
        )
      );
      alert('Order marked as Delivered successfully!');
    } catch (err) {
      console.error("Error marking order as delivered: ", err);
      setError("Failed to mark order as delivered.");
      alert("Failed to mark order as delivered. Please try again.");
    }
  };

  if (loading) return <p className="p-4 text-center text-lg text-gray-700">Loading orders...</p>;
  if (error) return <p className="p-4 text-center text-lg text-red-600">{error}</p>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 pb-3">Order List</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-xl py-10">No orders found.</p>
      ) : (
        <div className="shadow-lg rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-200 text-gray-700 uppercase text-sm font-semibold">
                  <th className="py-3 px-6 text-left border-b border-gray-300">Image</th>
                  <th className="py-3 px-6 text-left border-b border-gray-300">Product Name</th>
                  <th className="py-3 px-6 text-left border-b border-gray-300">Price</th>
                  <th className="py-3 px-6 text-left border-b border-gray-300">Status</th>
                  <th className="py-3 px-6 text-left border-b border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) =>
                  order.cartItems.map((item, idx) => {
                    const imageUrl =
                      item.product?.images?.[0]?.url
                        ? `https://admin-backend-x8of.onrender.com/uploads/${item.product.images[0].url}`
                        : "/placeholder.jpg"; // fallback image

                    return (
                      <tr key={order._id + "-" + idx} className="hover:bg-gray-100 border-b border-gray-200">
                        <td className="py-4 px-6">
                          <img
                            width={50}
                            src={imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md shadow"
                          />
                        </td>
                        <td className="py-4 px-6 text-gray-800 font-medium">{item.name}</td>
                        <td className="py-4 px-6 text-gray-700 font-semibold">₹{item.price}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                              order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-3 items-center">
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded text-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                              View Details
                            </Link>
                            {/* Show Mark as Delivered button only if status is not Delivered or Cancelled */}
                            {(order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled') && (
                              <button
                                onClick={() => handleMarkAsDelivered(order._id)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-3 rounded text-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
