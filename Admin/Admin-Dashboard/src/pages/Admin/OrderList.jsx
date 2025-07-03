import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios"; // Assuming this is your configured axios instance

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10); // Number of orders to display per page

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/admin/orders");
        // Sort orders by creation date (assuming 'createdAt' field exists)
        const sortedOrders = (res.data.orders || []).sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders: ", err);
        setError("Failed to fetch orders. " + (err.response?.data?.message || err.message));
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
      // --- START OF CHANGE ---
      // IMPORTANT: Changed URL from `/admin/orders/${orderId}/status` to `/admin/order/${orderId}`
      // IMPORTANT: Changed request body key from `orderStatus` to `status`
      const res = await api.put(`/admin/order/${orderId}`, { status: 'Delivered' });
      // --- END OF CHANGE ---

      if (res.status === 200) { // Check if the update was successful
        // Update the local state to reflect the change
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? { ...order, orderStatus: 'Delivered' } : order
          )
        );
        alert('Order marked as Delivered successfully!');
      } else {
        alert('Failed to mark order as Delivered. Server responded with an unexpected status.');
      }
    } catch (err) {
      console.error("Error marking order as delivered: ", err);
      setError("Failed to mark order as delivered. " + (err.response?.data?.message || err.message || "Please try again."));
      alert("Failed to mark order as delivered: " + (err.response?.data?.message || err.message || "An unknown error occurred."));
    }
  };

  // Logic for pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                {currentOrders.map((order) => // Use currentOrders for pagination
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 flex justify-center items-center space-x-2 bg-gray-100 border-t border-gray-200">
              {[...Array(totalPages).keys()].map(number => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ease-in-out ${
                    currentPage === number + 1
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {number + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
