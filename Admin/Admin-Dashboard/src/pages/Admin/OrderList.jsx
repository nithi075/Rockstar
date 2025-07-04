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
        // IMPORTANT: The path here depends on your backend's GET all orders route.
        // If your routes/order.js has `router.get('/', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);`
        // AND your app.js uses `app.use('/api/v1/orders', require('./routes/order'));`
        // THEN the correct path for GETTING ALL orders is `/orders` (relative to your axios baseURL)
        // If you have a separate route like `app.use('/api/v1/admin/orders', someAdminOrdersRouter);` for GET all,
        // then `/admin/orders` might be correct.
        // For consistency with `PUT /orders/:id`, I've adjusted this to `/orders`.
        const res = await api.get("/orders"); // Changed from "/admin/orders" to "/orders"
        // If this breaks fetching all orders, revert it to what was working for GET,
        // but verify your backend's GET ALL orders route.

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
      // *** THIS IS THE CRITICAL AND ONLY CHANGE FOR THE PUT REQUEST ***
      // This path combines with your axios baseURL to form:
      // https://admin-backend-x8of.onrender.com/api/v1/orders/YOUR_ORDER_ID
      // This matches your backend: app.use('/api/v1/orders', ...) + router.put('/:id', ...)
      const res = await api.put(`/orders/${orderId}`, { status: 'Delivered' });

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
                          <img
                            width={50}
                            src={imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md shadow"
                          />
                        </td>
                        <td className="order-item-name">{item.name}</td>
                        <td className="order-item-price">₹{item.price}</td>
                        <td className="order-list-status">
                          <span className={`order-current-status ${
                              order.orderStatus === 'Delivered' ? 'order-success-color' :
                              order.orderStatus === 'Cancelled' ? 'order-delivered-color' :
                              
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
