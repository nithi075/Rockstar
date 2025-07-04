// pages/Admin/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from '../../axios'; // Using your custom axios instance

export default function OrderDetails() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Using your custom 'api' instance
                // This will make a GET request to e.g., https://admin-backend-x8of.onrender.com/api/v1/orders/6856ea41e686ec987e91f2cd
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

    // Display loading, error, or not found messages
    if (loading) return <p className="loading-order-details">Loading order details...</p>;
    if (error) return <p className="details-loading-error">{error}</p>;
    if (!order) return <p className="order-not-found">Order not found.</p>;

    // Define your backend's base URL for static assets (like product images)
    // IMPORTANT: Make sure this URL is correct and points to where your backend serves images.
    // Based on your previous successful GET request to Render, this should be correct.
    const BACKEND_STATIC_ASSETS_BASE_URL = 'https://admin-backend-x8of.onrender.com';

    // Calculate total from cartItems for display, as backend 'totalPrice' is sometimes 0
    const calculatedItemsTotal = order.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="details-order">
            <h2 className="order-id-details">Order Details - #{order._id}</h2>

            {/* Customer Information Section */}
            <div className="order-cus-info">
                <h3 className="order-customer-info">Customer Information:</h3>
                {/* Accessing data from the 'customerInfo' object directly */}
                <p className="mb-2"><strong className="customer-name">Name:</strong> {order.customerInfo?.name || 'N/A'}</p>
                {/* Assuming email is NOT present in customerInfo based on your JSON. If it is, add it here. */}
                {/* <p className="mb-2"><strong className="font-semibold text-gray-700">Email:</strong> {order.customerInfo?.email || 'N/A'}</p> */}
                <p className="mb-2"><strong className="customer-phone-number">Phone:</strong> {order.customerInfo?.phone || 'N/A'}</p>
                <p className="mb-2"><strong className="customer-address">Address:</strong>
                    {/* Displaying address as-is from the backend (it contains newlines) */}
                    {order.customerInfo?.address ? (
                        <pre className="customer-info-details-notFound">{order.customerInfo.address}</pre>
                    ) : 'N/A'}
                </p>
                <p className="mb-2"><strong className="Order-Date">Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p className="mb-2"><strong className="Order-current-Status">Current Status:</strong>
                    <span className={`Order-info-status ${
                        order.orderStatus === 'Delivered' ? 'Delivered-status' :
                        order.orderStatus === 'Processing' ? 'Processing-status' :
                        order.orderStatus === 'Cancelled' ? 'cancelled-order' :
                        'bg-gray-100 text-gray-800' // Default if status is unknown
                    }`}>
                        {order.orderStatus || 'N/A'}
                    </span>
                </p>
                {order.deliveredAt && <p className="mb-2"><strong className="Delivered-At">Delivered At:</strong> {new Date(order.deliveredAt).toLocaleString()}</p>}
            </div>

       


            {/* Ordered Items Section */}
            <div>
                <h3 className="Ordered-items">Ordered Items:</h3>
                <ul className="items-that-ordered">
                    {order.cartItems && order.cartItems.length > 0 ? (
                        order.cartItems.map((item, index) => (
                            <li key={item._id || index} className="Ordered-items-img">
                                <img
                                    // Construct the image URL: BACKEND_STATIC_ASSETS_BASE_URL + /uploads/ + item.product.images[0].url
                                    width={100}
                                    src={item.product?.images?.[0]?.url ? `${BACKEND_STATIC_ASSETS_BASE_URL}/uploads/${item.product.images[0].url}` : 'https://via.placeholder.com/64'}
                                    alt={item.product?.name || "Product Image"}
                                    className="image-order-items"
                                />
                                <div className="ordered-product">
                                    <p className="Unknown-product">
                                        <strong>{item.product?.name || 'Unknown Product'}</strong>
                                    </p>
                                    {/* Assuming 'size' is directly on the cart item object */}
                                    {item.size && <p className="ordered-item-size">Size: <span className="size-font">{item.size}</span></p>}
                                    <p className="Ordered-items-quantity">Quantity: <span className="quantity-font">{item.quantity}</span></p>
                                    <p className="ordered-item-price">Price: <span className="price-font">₹{item.price.toFixed(2)}/item</span></p>
                                   
                                </div>
                                <div className="item-price-quantity">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="No-ordered-items">No items in this order.</p>
                    )}
                </ul>
            </div>

            {/* Grand Total Section (calculated from cart items) */}
            {order.cartItems && order.cartItems.length > 0 && (
                <div className="Order-total">
                    <p className="total-items-cost">
                        Total Items Cost: ₹{calculatedItemsTotal.toFixed(2)}
                    </p>
                </div>
            )}
        </div>
    );
}
