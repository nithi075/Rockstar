import React, { useEffect, useState } from "react";
import axios from "../../axios"; // your axios instance
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

  if (loading) return <p className="loader">Loading...</p>;

  return order ? (
    <div className="order-details">
      <h2>Order ID: {order._id}</h2>
      <p>Customer: {order.customerInfo.name}</p>
      <p>Email: {order.customerInfo.email}</p>
      <p>Phone: {order.customerInfo.phone}</p>
      <p>Date: {new Date(order.createdAt).toLocaleString()}</p>

      <h3>Items:</h3>
      <ul>
        {order.cartItems.map((item, index) => (
          <li key={index}>
            <img
              src={`https://admin-backend-x8of.onrender.com${item.product.image}`}
              alt={item.product.name}
              width="60"
            />
            <div>
              {item.product.name} (Size: {item.size}) × {item.quantity} = ₹
              {item.price * item.quantity}
            </div>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <p>Order not found</p>
  );
}
