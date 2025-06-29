// pages/Admin/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`https://admin-backend-x8of.onrender.com/api/v1/orders/${orderId}`);
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
        <p><strong className="
        Cust-Name">Name:</strong> {order.customerInfo?.name}</p>
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
            {/* THIS IS THE PRIMARY PLACE TO CHANGE */}
            <img
              // **POTENTIAL CHANGE HERE:**
              // You need to ensure the URL constructed here exactly matches
              // how your backend serves the images.
              //
              // Option 1 (Most Common): If item.product.images[0].url is JUST the filename (e.g., "product123.jpg")
              src={item.product?.images?.[0]?.url ? `https://admin-backend-x8of.onrender.com/api/v1/${item.product.images[0].url}` : "/placeholder.jpg"}

              // Option 2: If item.product.images[0].url ALREADY includes "/uploads/" (e.g., "/uploads/product123.jpg")
              // src={item.product?.images?.[0]?.url ? `http://localhost:5000${item.product.images[0].url}` : "/placeholder.jpg"}

              // Option 3: If item.product.images[0].url is ALREADY a complete URL (e.g., "http://localhost:5000/uploads/product123.jpg")
              // src={item.product?.images?.[0]?.url ? item.product.images[0].url : "/placeholder.jpg"}

              // Option 4 (Robust): Handles cases where 'url' might or might not start with a '/'
              // src={item.product?.images?.[0]?.url
              //   ? `http://localhost:5000/${item.product.images[0].url.startsWith('/') ? item.product.images[0].url.substring(1) : item.product.images[0].url}`
              //   : "/placeholder.jpg"
              // }

              width={100}
              alt={item.product?.name || "Product Image"} // Good practice to have a fallback for alt text
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
