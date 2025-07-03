import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10); // Display 10 orders per page

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Using `api` from the first example, assuming it's configured for your backend
        // If not, you might need to adjust the base URL for axios.
        const res = await axios.get("/admin/orders"); // Assuming /admin/orders for admin panel
        // Sort orders by creation date (assuming 'createdAt' field exists)
        const sortedOrders = (res.data.orders || []).sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleMarkAsDelivered = async (orderId) => {
    try {
      // Assuming an API endpoint like /admin/orders/:id/deliver for marking as delivered
      await axios.put(`/admin/orders/${orderId}/deliver`, { status: 'Delivered' });
      // Update the order status in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: 'Delivered', orderStatus: 'Delivered' } : order // Ensure both 'status' and 'orderStatus' are updated if applicable
        )
      );
      alert('Order marked as Delivered!');
    } catch (err) {
      console.error("Error marking order as delivered:", err);
      alert("Failed to mark order as delivered. " + (err.response?.data?.message || err.message));
    }
  };

  const calculateTotalAmount = (cartItems) => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
  };

  // Calculate orders to display on the current page
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Calculate total pages
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p className="p-4 text-lg text-gray-700">Loading orders...</p>;
  if (error) return <p className="p-4 text-lg text-red-600">{error}</p>;

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
                  <th className="py-3 px-6 text-left border-b border-gray-300">Product Image</th>
                  <th className="py-3 px-6 text-left border-b border-gray-300">Customer Name</th>
                  <th className="py-3 px-6 text-left border-b border-gray-300">Total Items</th>
                  <th className="py-3 px-6 text-left border-b border-gray-300">Total Amount</th>
                  <th className="py-3 px-6 text-left border-b border-gray-300">Status</th>
                  <th className="py-3 px-6 text-left border-b border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-100 border-b border-gray-200">
                    <td className="py-4 px-6">
                      {order.cartItems && order.cartItems.length > 0 && order.cartItems[0].product?.images?.[0]?.url ? (
                        <img
                          src={`https://admin-backend-x8of.onrender.com/uploads/${order.cartItems[0].product.images[0].url}`} // Using the specified backend URL
                          alt={order.cartItems[0].product?.name || "Product Image"}
                          className="w-16 h-16 object-cover rounded-md shadow"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md text-gray-500 text-xs text-center">No Image</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-800 font-medium">{order.customerInfo?.name || 'N/A'}</td>
                    <td className="py-4 px-6 text-gray-700">{order.cartItems?.length || 0}</td>
                    <td className="py-4 px-6 text-gray-700 font-semibold">₹{calculateTotalAmount(order.cartItems || [])}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                          order.status === 'Delivered' || order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Cancelled' || order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status || order.orderStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-3 items-center">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out"
                        >
                          View
                        </Link>
                        {(order.status !== 'Delivered' && order.status !== 'Cancelled' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled') && (
                          <button
                            onClick={() => handleMarkAsDelivered(order._id)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-3 rounded text-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                          >
                            Mark as Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
