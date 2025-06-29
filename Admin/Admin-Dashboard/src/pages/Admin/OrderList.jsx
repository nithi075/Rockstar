// pages/Admin/OrderList.jsx
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
        const res = await axios.get("/orders");
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
      // Assuming an API endpoint like /orders/:id/deliver for marking as delivered
      await axios.put(`/orders/${orderId}/deliver`, { status: 'Delivered' });
      // Update the order status in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: 'Delivered' } : order
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

  if (loading) return <p className="Load-order">Loading orders...</p>;
  if (error) return <p className="error-order">{error}</p>;

  return (
    <div className="Order-details">
      <h1 className="o-list">Order List</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="pro-order-list">
          <table className="order-table">
            <thead className="order-table-list">
              <tr>
                <th className="order-pro-img">Product Image</th>
                <th className="order-cust-name">Customer Name</th>
                <th className="order-list">Total Items</th>
                <th className="order-total-amount">Total Amount</th>
                <th className="order-status">Status</th>
                <th className="order-action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(order => ( // Use currentOrders here
                <tr key={order._id} className="details-order">
                  <td className="order-img">
                    {order.cartItems && order.cartItems.length > 0 && order.cartItems[0].product?.images?.[0]?.url ? (
                      <img
                        
                        src={`http://localhost:5000/uploads/${order.cartItems[0].product.images[0].url}`}
                        alt={order.cartItems[0].product?.name || "Product"}
                        className="ord-img"
                      />
                    ) : (
                      <div className="order-no-img">No Image</div>
                    )}
                  </td>
                  <td className="order-info-name" >{order.customerInfo?.name || 'N/A'}</td>
                  <td className="order-length-cartitems">{order.cartItems?.length || 0}</td>
                  <td className="cart-total-amount">₹{calculateTotalAmount(order.cartItems || [])}</td>
                  <td className="order-status">
                    <span className={`order-current-status ${
                        order.status === 'Delivered' ? 'deliverd-order' :
                        order.status === 'Cancelled' ? 'cancelled-order' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                        {order.status}
                    </span>
                  </td>
                  <td className="order-id">
                    <div className="order-admin">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="order-view"
                      >
                        View
                      </Link>
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
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
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              {[...Array(totalPages).keys()].map(number => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`page-number ${
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
