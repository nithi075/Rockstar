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
    if (loading) return <p className="p-4 text-center text-gray-600">Loading order details...</p>;
    if (error) return <p className="p-4 text-center text-red-500 font-bold">{error}</p>;
    if (!order) return <p className="p-4 text-center text-gray-600">Order not found.</p>;

    // Define your backend's base URL for static assets (like product images)
    // IMPORTANT: Make sure this URL is correct and points to where your backend serves images.
    // Based on your previous successful GET request to Render, this should be correct.
    const BACKEND_STATIC_ASSETS_BASE_URL = 'https://admin-backend-x8of.onrender.com';

    // Calculate total from cartItems for display, as backend 'totalPrice' is sometimes 0
    const calculatedItemsTotal = order.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 pb-3">Order Details - #{order._id}</h2>

            {/* Customer Information Section */}
            <div className="mb-6 p-4 border rounded-md bg-white shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Customer Information:</h3>
                {/* Accessing data from the 'customerInfo' object directly */}
                <p className="mb-2"><strong className="font-semibold text-gray-700">Name:</strong> {order.customerInfo?.name || 'N/A'}</p>
                {/* Assuming email is NOT present in customerInfo based on your JSON. If it is, add it here. */}
                {/* <p className="mb-2"><strong className="font-semibold text-gray-700">Email:</strong> {order.customerInfo?.email || 'N/A'}</p> */}
                <p className="mb-2"><strong className="font-semibold text-gray-700">Phone:</strong> {order.customerInfo?.phone || 'N/A'}</p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Address:</strong>
                    {/* Displaying address as-is from the backend (it contains newlines) */}
                    {order.customerInfo?.address ? (
                        <pre className="inline-block whitespace-pre-wrap font-sans text-base leading-normal">{order.customerInfo.address}</pre>
                    ) : 'N/A'}
                </p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Current Status:</strong>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800' // Default if status is unknown
                    }`}>
                        {order.orderStatus || 'N/A'}
                    </span>
                </p>
                {order.deliveredAt && <p className="mb-2"><strong className="font-semibold text-gray-700">Delivered At:</strong> {new Date(order.deliveredAt).toLocaleString()}</p>}
            </div>

       


            {/* Ordered Items Section */}
            <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Ordered Items:</h3>
                <ul className="space-y-4">
                    {order.cartItems && order.cartItems.length > 0 ? (
                        order.cartItems.map((item, index) => (
                            <li key={item._id || index} className="border p-4 rounded-md flex items-center gap-6 bg-white shadow-sm">
                                <img
                                    // Construct the image URL: BACKEND_STATIC_ASSETS_BASE_URL + /uploads/ + item.product.images[0].url
                                    width={100}
                                    src={item.product?.images?.[0]?.url ? `${BACKEND_STATIC_ASSETS_BASE_URL}/uploads/${item.product.images[0].url}` : 'https://via.placeholder.com/64'}
                                    alt={item.product?.name || "Product Image"}
                                    className="w-20 h-20 object-cover rounded-md border"
                                />
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-gray-800">
                                        <strong>{item.product?.name || 'Unknown Product'}</strong>
                                    </p>
                                    {/* Assuming 'size' is directly on the cart item object */}
                                    {item.size && <p className="text-gray-600">Size: <span className="font-medium">{item.size}</span></p>}
                                    <p className="text-gray-600">Quantity: <span className="font-medium">{item.quantity}</span></p>
                                    <p className="text-gray-700">Price: <span className="font-medium">₹{item.price.toFixed(2)}/item</span></p>
                                    {item.product?._id && ( // Optional: Link to product details if ID exists
                                        <Link to={`/admin/product/${item.product._id}`} className="text-blue-500 hover:underline text-sm">
                                            View Product
                                        </Link>
                                    )}
                                </div>
                                <div className="text-right text-lg font-bold text-gray-800">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-600">No items in this order.</p>
                    )}
                </ul>
            </div>

            {/* Grand Total Section (calculated from cart items) */}
            {order.cartItems && order.cartItems.length > 0 && (
                <div className="mt-6 p-4 border-t-2 border-gray-200 text-right bg-white rounded-md shadow-sm">
                    <p className="text-xl font-bold text-gray-900">
                        Total Items Cost: ₹{calculatedItemsTotal.toFixed(2)}
                    </p>
                </div>
            )}
        </div>
    );
}
