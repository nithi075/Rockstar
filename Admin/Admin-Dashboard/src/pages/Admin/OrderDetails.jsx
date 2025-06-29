// pages/Admin/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios"; // Assuming you import your custom axios instance

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hardcoded root URL for images - THIS IS THE MOST PROBLEMATIC ONE
  const backendRootUrl = 'https://admin-backend-x8of.onrender.com';

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // This relies on api.baseURL already being set
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
      {/* ... (rest of your component) ... */}
      <ul className="Order-details">
        {order.cartItems.map((item) => (
          <li key={item._id} className="Cust-id">
            <img
              src={item.product?.images?.[0]?.url
                ? (item.product.images[0].url.startsWith('http')
                    ? item.product.images[0].url
                    : `${backendRootUrl}/uploads/${item.product.images[0].url.startsWith('/') ? item.product.images[0].url.substring(1) : item.product.images[0].url}`
                  )
                : "/placeholder.jpg"
              }
              width={100}
              alt={item.product?.name || "Product Image"}
              className="Cust-image"
            />
            {/* ... rest of item details ... */}
          </li>
        ))}
      </ul>
      {/* ... (rest of your component) ... */}
    </div>
  );
};

export default OrderDetails;
