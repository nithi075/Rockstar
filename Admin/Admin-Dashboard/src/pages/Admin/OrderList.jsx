// pages/Admin/OrderList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios"; // ✅ correct import

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/admin/orders");
        const sortedOrders = (res.data.orders || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } catch (err) {
        setError("Failed to fetch orders. " + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleMarkAsDelivered = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/deliver`, { status: "Delivered" });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "Delivered" } : order
        )
      );
      alert("Order marked as Delivered!");
    } catch (err) {
      alert("Failed to update status. " + (err.response?.data?.message || err.message));
    }
  };

  const calculateTotalAmount = (cartItems = []) =>
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (page) => setCurrentPage(page);

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
              {currentOrders.map((order) => (
                <tr key={order._id} className="details-order">
                  <td className="order-img">
                    {order.cartItems?.[0]?.product?.images?.[0]?.url ? (
                      <img
                        src={`http://localhost:5000/uploads/${order.cartItems[0].product.images[0].url}`}
                        alt={order.cartItems[0].product?.name || "Product"}
                        className="ord-img"
                      />
                    ) : (
                      <div className="order-no-img">No Image</div>
                    )}
                  </td>
                  <td className="order-info-name">{order.customerInfo?.name || "N/A"}</td>
                  <td className="order-length-cartitems">{order.cartItems?.length || 0}</td>
                  <td className="cart-total-amount">₹{calculateTotalAmount(order.cartItems)}</td>
                  <td className="order-status">
                    <span
                      className={`order-current-status ${
                        order.status === "Delivered"
                          ? "deliverd-order"
                          : order.status === "Cancelled"
                          ? "cancelled-order"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="order-id">
                    <div className="order-admin">
                      <Link to={`/admin/orders/${order._id}`} className="order-view">
                        View
                      </Link>
                      {order.status !== "Delivered" && order.status !== "Cancelled" && (
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
