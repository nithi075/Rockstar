import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { Link } from "react-router-dom";
import api from "../../axios"; // Assuming this is your configured axios instance
import './OrderList.css'; // Make sure you import your CSS file

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10; // No need for useState if it's a constant

  // Using useCallback for handleMarkAsDelivered to prevent unnecessary re-creations
  // This is a minor optimization, mainly useful if this function was passed as a prop
  // to a memoized child component. For this direct usage, it's not strictly necessary but good practice.
  const handleMarkAsDelivered = useCallback(async (orderId) => {
    if (!window.confirm("Are you sure you want to mark this order as Delivered?")) {
      return;
    }

    try {
      // Your API call logic remains correct
      const res = await api.put(`/orders/${orderId}`, { status: 'Delivered' });

      if (res.status === 200) {
        // Update the local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? { ...order, orderStatus: 'Delivered' } : order
          )
        );
        alert('Order marked as Delivered successfully!');
      } else {
        // More specific error message for unexpected status
        alert(`Failed to mark order as Delivered. Server responded with status: ${res.status}`);
      }
    } catch (err) {
      console.error("Error marking order as delivered: ", err);
      const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred.";
      setError(`Failed to mark order as delivered. ${errorMessage}`);
      alert(`Failed to mark order as delivered: ${errorMessage}`);
    }
  }, []); // Empty dependency array as it doesn't depend on any props or state outside its scope

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
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
  }, []); // Empty dependency array, runs once on mount

  // Logic for pagination - these calculations are correct
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p className="Loading-Order">Loading orders...</p>;
  if (error) return <p className="Loading-error">{error}</p>;

  return (
    <div className="Order-List-Details">
      <h1 className="Order-List-info">Order List</h1>

      {orders.length === 0 ? (
        <p className="No-Order-Found">No orders found.</p>
      ) : (
        <div className="order-details-list">
          <div className="order-det-list">
            <table className="order-list-table">
              <thead>
                <tr className="orderList-details">
                  <th className="orderList-images">Image</th>
                  <th className="orderList-Product-Name">Product Name</th>
                  <th className="order-list-Price">Price</th>
                  <th className="order-list-status">Status</th>
                  <th className="order-list-action">Actions</th>
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
                      <tr key={order._id + "-" + idx} className="orders-List-Img">
                        <td className="orders-img">
                          {/* Removed the Tailwind classes (w-16 h-16 object-cover rounded-md shadow)
                              as they should be handled by your CSS for consistency.
                              If you are using Tailwind, you would keep them.
                              Assuming you want all styling in the .css file. */}
                          <img
                            width={50} // Keep width for initial sizing or if CSS fails
                            src={imageUrl}
                            alt={item.name}
                          />
                        </td>
                        <td className="order-item-name">{item.name}</td>
                        <td className="order-item-price">₹{item.price}</td>
                        <td className="order-list-status">
                          <span className={`order-current-status ${
                              order.orderStatus === 'Delivered' ? 'order-success-color' :
                              order.orderStatus === 'Cancelled' ? 'order-delivered-color' :
                              '' // Empty string if neither 'Delivered' nor 'Cancelled'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="order-table-items">
                          <div className="table-items-of-order">
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="view-details"
                            >
                              View Details
                            </Link>
                            {/* Show Mark as Delivered button only if status is not Delivered or Cancelled */}
                            {(order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled') && (
                              <button
                                onClick={() => handleMarkAsDelivered(order._id)}
                                className="delivery-button"
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
            <div className="order-page">
              {[...Array(totalPages).keys()].map(number => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`current-page ${
                    currentPage === number + 1
                      ? 'more-than-one'
                      : 'less-than-one'
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
