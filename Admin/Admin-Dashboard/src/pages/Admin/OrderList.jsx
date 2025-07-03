import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './OrderList.css'; // Don't forget to create this CSS file and import it!

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
        const res = await axios.get("/admin/orders"); // Adjust if your API endpoint is different
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
      await axios.put(`/admin/orders/${orderId}/deliver`, { status: 'Delivered' });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: 'Delivered', orderStatus: 'Delivered' } : order
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

  if (loading) return <p className="loading-message">Loading orders...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="order-list-container">
      <h1 className="order-list-title">Order List</h1>

      {orders.length === 0 ? (
        <p className="no-orders-found">No orders found.</p>
      ) : (
        <div className="order-table-wrapper">
          <div className="order-table-scroll">
            <table className="order-table">
              <thead>
                <tr className="order-table-header-row">
                  <th className="order-table-header">Product Image</th>
                  <th className="order-table-header">Customer Name</th>
                  <th className="order-table-header">Total Items</th>
                  <th className="order-table-header">Total Amount</th>
                  <th className="order-table-header">Status</th>
                  <th className="order-table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map(order => (
                  <tr key={order._id} className="order-table-row">
                    <td className="order-item-image-cell">
                      {order.cartItems && order.cartItems.length > 0 && order.cartItems[0].product?.images?.[0]?.url ? (
                        <img
                          src={`https://admin-backend-x8of.onrender.com/uploads/${order.cartItems[0].product.images[0].url}`}
                          alt={order.cartItems[0].product?.name || "Product Image"}
                          className="order-item-image"
                        />
                      ) : (
                        <div className="order-no-image">No Image</div>
                      )}
                    </td>
                    <td className="order-customer-name">{order.customerInfo?.name || 'N/A'}</td>
                    <td className="order-total-items">{order.cartItems?.length || 0}</td>
                    <td className="order-total-amount">₹{calculateTotalAmount(order.cartItems || [])}</td>
                    <td className="order-status-cell">
                      <span className={`order-status-badge ${
                          order.status === 'Delivered' || order.orderStatus === 'Delivered' ? 'status-delivered' :
                          order.status === 'Cancelled' || order.orderStatus === 'Cancelled' ? 'status-cancelled' :
                          'status-pending'
                      }`}>
                        {order.status || order.orderStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="order-actions-cell">
                      <div className="order-actions">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="order-view-button"
                        >
                          View
                        </Link>
                        {(order.status !== 'Delivered' && order.status !== 'Cancelled' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled') && (
                          <button
                            onClick={() => handleMarkAsDelivered(order._id)}
                            className="order-mark-delivered-button"
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
            <div className="pagination-controls">
              {[...Array(totalPages).keys()].map(number => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`pagination-button ${currentPage === number + 1 ? 'pagination-active' : ''}`}
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
