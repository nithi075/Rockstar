// pages/Admin/OrderDetails.jsx
import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useParams, Link } from "react-router-dom";
import api from '../../axios'; // Using your custom axios instance


export default function OrderDetails() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use useCallback for memoizing fetchOrder to prevent unnecessary re-creations
    const fetchOrder = useCallback(async () => {
        try {
            const { data } = await api.get(`/orders/${orderId}`);
            setOrder(data.order);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch order details", err);
            setError("Failed to load order details. " + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    }, [orderId]); // Dependency on orderId ensures refetch if ID changes

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]); // Dependency on memoized fetchOrder function

    // Display loading, error, or not found messages
    if (loading) return <p className="loading-order-details">Loading order details...</p>;
    if (error) return <p className="details-loading-error">{error}</p>;
    if (!order) return <p className="order-not-found">Order not found.</p>;

    // Define your backend's base URL for static assets (like product images)
    const BACKEND_STATIC_ASSETS_BASE_URL = 'https://admin-backend-x8of.onrender.com';

    // Calculate total from cartItems for display
    const calculatedItemsTotal = order.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="details-order">
            <h2 className="order-id-details">Order Details - #{order._id}</h2>

            {/* Customer Information Section */}
            <div className="order-cus-info">
                <h3 className="order-customer-info">Customer Information:</h3>
                <p className="mb-2"><strong className="customer-name">Name:</strong> {order.customerInfo?.name || 'N/A'}</p>
                {/* Re-added email as a common customer field, uncomment if your backend sends it */}
                {/* <p className="mb-2"><strong className="customer-email">Email:</strong> {order.customerInfo?.email || 'N/A'}</p> */}
                <p className="mb-2"><strong className="customer-phone-number">Phone:</strong> {order.customerInfo?.phone || 'N/A'}</p>
                <p className="mb-2">
                    <strong className="customer-address">Address:</strong>
                    {/* Using <pre> tag for pre-formatted text if address contains newlines,
                        otherwise consider using a regular div/span and replacing newlines with <br /> */}
                    {order.customerInfo?.address ? (
                        <pre className="customer-info-details-address">{order.customerInfo.address}</pre>
                    ) : 'N/A'}
                </p>
                <p className="mb-2"><strong className="Order-Date">Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p className="mb-2">
                    <strong className="Order-current-Status">Current Status:</strong>
                    <span className={`Order-info-status ${
                        order.orderStatus === 'Delivered' ? 'Delivered-status' :
                        order.orderStatus === 'Processing' ? 'Processing-status' :
                        order.orderStatus === 'Cancelled' ? 'cancelled-order' :
                        'Default-status' // Added a default class for consistent styling
                    }`}>
                        {order.orderStatus || 'N/A'}
                    </span>
                </p>
                {order.deliveredAt && (
                    <p className="mb-2"><strong className="Delivered-At">Delivered At:</strong> {new Date(order.deliveredAt).toLocaleString()}</p>
                )}
            </div>

            {/* Ordered Items Section */}
            <div>
                <h3 className="Ordered-items">Ordered Items:</h3>
                <ul className="items-that-ordered">
                    {order.cartItems && order.cartItems.length > 0 ? (
                        order.cartItems.map((item, index) => (
                            // Using item._id for key if available, otherwise fallback to index but be aware of list reordering issues
                            <li key={item._id || index} className="Ordered-items-list-item"> {/* Changed class name for clarity */}
                                <img
                                    width={64} // More standard small image size (adjust if needed)
                                    height={64} // Ensure aspect ratio is maintained with object-fit in CSS
                                    src={item.product?.images?.[0]?.url ? `${BACKEND_STATIC_ASSETS_BASE_URL}/uploads/${item.product.images[0].url}` : 'https://via.placeholder.com/64'}
                                    alt={item.product?.name || "Product Image"}
                                    className="image-order-items"
                                />
                                <div className="ordered-product-info"> {/* Changed class name for clarity */}
                                    <p className="product-name-unknown"> {/* Changed class name for clarity */}
                                        <strong>{item.product?.name || 'Unknown Product'}</strong>
                                    </p>
                                    {item.size && <p className="ordered-item-size">Size: <span className="size-font">{item.size}</span></p>}
                                    <p className="Ordered-items-quantity">Quantity: <span className="quantity-font">{item.quantity}</span></p>
                                    <p className="ordered-item-price">Price: <span className="price-font">₹{item.price.toFixed(2)}/item</span></p>
                                </div>
                                <div className="item-price-quantity-total"> {/* Changed class name for clarity */}
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
                        Grand Total: ₹{calculatedItemsTotal.toFixed(2)} {/* Changed text to Grand Total for clarity */}
                    </p>
                </div>
            )}
        </div>
    );
}
