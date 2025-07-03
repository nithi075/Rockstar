import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios"; // ✅ Use shared Axios instance

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // CORRECTED: Ensure this endpoint matches your backend route for fetching all orders
        // Your backend returns an object with a 'orders' array
        const res = await api.get("/orders/admin/orders");
        const sortedOrders = (res.data.orders || []).sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setError("Failed to fetch orders. " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleMarkAsDelivered = async (orderId) => {
    try {
      // Use your backend's specific update route, which expects 'status' in body
      await api.put(`/orders/${orderId}`, { status: 'Delivered' }); // Assuming '/orders/:id' handles status update
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, orderStatus: 'Delivered' } : order // Update orderStatus
        )
      );
      alert("Order marked as delivered!");
    } catch (err) {
      alert("Failed to update status. " + (err.response?.data?.message || err.message));
    }
  };

  // Ensure this calculates based on 'orderItems'
  const calculateTotalAmount = (orderItems) =>
    orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const paginate = (page) => setCurrentPage(page);

  if (loading) return <p className="Load-order">Loading orders...</p>;
  if (error) return <p className="error-order">{error}</p>;

  return (
    <div className="Order-details"> {/* This class name might be misleading for a list */}
      <h1 className="o-list">Order List</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="pro-order-list">
          <table className="order-table">
            <thead className="order-table-list">
              <tr>
                <th className="order-id-header">Order ID</th> {/* Changed class name for clarity */}
                <th className="order-pro-img">Product Image</th>
                <th className="order-cust-name">Customer Name</th>
                <th className="order-list">Total Items</th>
                <th className="order-total-amount">Total Amount</th>
                <th className="order-status">Status</th>
                <th className="order-action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order._id} className="details-order">
                  <td className="order-id">
                    {/* Display truncated ID or custom ID if available */}
                    {order.customId ? order.customId : order._id.substring(0, 10) + '...'}
                  </td>
                  <td className="order-img">
                    {/* MODIFIED: Access 'image' directly from the first item in 'orderItems' */}
                    {order.orderItems?.[0]?.image ? (
                      <img
                        src={order.orderItems[0].image.startsWith('http')
                          ? order.orderItems[0].image
                          : `https://admin-backend-x8of.onrender.com/uploads/${order.orderItems[0].image}`
                        }
                        alt={order.orderItems[0].name || "Product Image"}
                        className="ord-img" // Apply your existing CSS class
                      />
                    ) : (
                      <div className="order-no-img">No Image</div>
                    )}
                  </td>
                  {/* MODIFIED: Use order.user.name as populated from the backend */}
                  <td className="order-info-name">{order.user?.name || 'N/A'}</td>
                  {/* MODIFIED: Use order.orderItems.length */}
                  <td className="order-length-cartitems">{order.orderItems?.length || 0}</td>
                  {/* MODIFIED: Calculate total based on order.orderItems */}
                  <td className="cart-total-amount">₹{calculateTotalAmount(order.orderItems || [])}</td>
                  <td className="order-status">
                    <span
                      className={`order-current-status ${
                        // MODIFIED: Use order.orderStatus
                        order.orderStatus === "Delivered"
                          ? "deliverd-order"
                          : order.orderStatus === "Cancelled"
                          ? "cancelled-order"
                          : "bg-blue-100 text-blue-800" // Default/Processing style
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="order-action-cell"> {/* Changed class name for clarity */}
                    <div className="order-admin">
                      <Link to={`/admin/orders/${order._id}`} className="order-view">
                        View
                      </Link>
                      {/* MODIFIED: Check against order.orderStatus */}
                      {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                        <button
                          onClick={() => handleMarkAsDelivered(order._id)}
                          className="order-delivered"
                        >
                          Delivered
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`page-number ${
                    currentPage === i + 1 ? "more-than-one" : "less-than-one"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
