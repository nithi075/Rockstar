import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { useParams } from "react-router-dom";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (error) {
        console.error("Failed to fetch order details", error);
        alert("Access denied or order not found");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="custom-loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!order) {
    return <p className="not-found">Order not found</p>;
  }

  return (
    <div className="order-details-container">
      <h2>Order ID: {order._id}</h2>
      <p><strong>Customer:</strong> {order.customerInfo.name}</p>
      <p><strong>Email:</strong> {order.customerInfo.email}</p>
      <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
      <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

      <h3>Items:</h3>
      <ul className="item-list">
        {order.cartItems.map((item, index) => (
          <li key={index} className="item">
            <img
              src={`https://admin-backend-x8of.onrender.com${item.product?.image || ""}`}
              alt={item.product?.name || "Product"}
              className="item-image"
            />
            <div className="item-details">
              <p>{item.product?.name} (Size: {item.size})</p>
              <p>Qty: {item.quantity}</p>
              <p>Total: ₹{item.price * item.quantity}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
