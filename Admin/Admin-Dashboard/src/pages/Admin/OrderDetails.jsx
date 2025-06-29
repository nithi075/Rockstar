// pages/Admin/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios"; // Import the custom axios instance

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // HARDCODED: Root URL for images. This needs to be changed manually for local dev.
  const backendRootUrl = 'https://admin-backend-x8of.onrender.com';

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Uses the baseURL configured in src/axios.js
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data.order);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch order details", err);
        setError("Failed to load order details. " + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <p className="Order-loading">Loading order details...</p>;
  if (error) return <p className="loading-error">{error}</p>;
  if (!order) return <p className="order-notfound">Order not found.</p>;

  return (
    <div className="Order-Details">
      <h2 className="Details">Order Details - #{order._id}</h2>

      <div className="Info">
        <h3 className="Cust-info">Customer Information:</h3>
        <p><strong className="Cust-Name">Name:</strong> {order.customerInfo?.name}</p>
        <p><strong className="Cust-Phone">Phone:</strong> {order.customerInfo?.phone}</p>
        <p><strong className="Cust-Address">Address:</strong> {order.customerInfo?.address || 'N/A'}</p>
        <p><strong className="Cust-OrderDate">Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p><strong className="Status">Current Status:</strong> <span className={`font-semibold ${
            order.status === 'Delivered' ? 'text-green-600' :
            order.status === 'Cancelled' ? 'text-red-600' :
            'text-blue-600'
        }`}>{order.status}</span></p>
      </div>

      <h3 className="Order-items">Ordered Items:</h3>
      <ul className="Order-details">
        {order.cartItems.map((item) => (
          <li key={item._id} className="Cust-id">
            <img
              // HARDCODED: Image URL construction
              src={item.product?.images?.[0]?.url
                ? (item.product.images[0].url.startsWith('http') // Check if it's already a full URL (e.g., Cloudinary)
                    ? item.product.images[0].url
                    : `${backendRootUrl}/uploads/${item.product.images[0].url.startsWith('/') ? item.product.images[0].url.substring(1) : item.product.images[0].url}`
                  )
                : "/placeholder.jpg"
              }
              width={100}
              alt={item.product?.name || "Product Image"}
              className="Cust-image"
            />
            <div className="More-cus-info">
              <p className="more-name">{item.product?.name || 'Unknown Product'}</p>
              <p className="more-size">Size: <span className="font-medium">{item.size}</span></p>
              <p className="more-size">Quantity: <span className="font-medium">{item.quantity}</span></p>
              <p className="more-price">Price: <span className="font-medium">₹{item.price.toFixed(2)}</span></p>
            </div>
            <div className="more-item-price">
                ₹{(item.price * item.quantity).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>

      <div className="order-reduce">
        Total: ₹{order.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
      </div>
    </div>
  );
};

export default OrderDetails;
