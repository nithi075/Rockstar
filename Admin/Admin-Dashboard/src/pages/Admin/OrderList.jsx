// src/pages/Admin/OrderList.jsx
import React, { useEffect, useState } from "react";
import api from "../../axios";
import { Link } from "react-router-dom";
import "./OrderList.css";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/admin/orders?page=${currentPage}&limit=${limit}`);
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="order-list-container">
      <h2 className="order-list-title">Order List</h2>

      {loading ? (
        <div className="loader">Loading Orders...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : orders.length === 0 ? (
        <div className="empty-message">No orders found.</div>
      ) : (
        <>
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <Link to={`/admin/orders/${order._id}`} className="order-link">
                      {order._id}
                    </Link>
                  </td>
                  <td>{order.customerInfo?.name || "N/A"}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>{order.orderStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={handlePrev} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderList;
