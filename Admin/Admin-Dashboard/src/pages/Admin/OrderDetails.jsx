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

    if (loading) return <p className="p-4 text-center text-gray-600">Loading order details...</p>;
    if (error) return <p className="p-4 text-center text-red-500 font-bold">{error}</p>;
    if (!order) return <p className="p-4 text-center text-gray-600">Order not found.</p>;

    // Define your backend's base URL for images
    // Replace 'https://admin-backend-x8of.onrender.com' with your actual backend URL if it changes.
    const BACKEND_BASE_URL = 'https://admin-backend-x8of.onrender.com';

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 pb-3">Order Details - #{order._id}</h2>

            <div className="mb-6 p-4 border rounded-md bg-white shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Customer Information:</h3>
                {/* Correctly access user and shippingInfo as per backend population */}
                <p className="mb-2"><strong className="font-semibold text-gray-700">Name:</strong> {order.user?.name || 'N/A'}</p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Email:</strong> {order.user?.email || 'N/A'}</p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Phone:</strong> {order.shippingInfo?.phoneNo || 'N/A'}</p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Address:</strong>
                    {order.shippingInfo ? (
                        `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state}, ${order.shippingInfo.pinCode}, ${order.shippingInfo.country}`
                    ) : 'N/A'}
                </p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Current Status:</strong>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                        {order.orderStatus}
                    </span>
                </p>
                {order.deliveredAt && <p className="mb-2"><strong className="font-semibold text-gray-700">Delivered At:</strong> {new Date(order.deliveredAt).toLocaleString()}</p>}
            </div>

            <div className="mb-6 p-4 border rounded-md bg-white shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Payment Information:</h3>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Payment ID:</strong> <span className="font-mono text-sm text-gray-700">{order.paymentInfo?.id || 'N/A'}</span></p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Payment Status:</strong>
                    <span className={`font-semibold ${
                        order.paymentInfo?.status === "succeeded" ? "text-green-600" : "text-red-600"
                    }`}>
                        {order.paymentInfo?.status || 'N/A'}
                    </span>
                </p>
            </div>

            <div className="mb-6 p-4 border rounded-md bg-white shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Pricing Summary:</h3>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Items Price:</strong> ₹{order.itemsPrice?.toFixed(2)}</p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Tax Price:</strong> ₹{order.taxPrice?.toFixed(2)}</p>
                <p className="mb-2"><strong className="font-semibold text-gray-700">Shipping Price:</strong> ₹{order.shippingPrice?.toFixed(2)}</p>
                <p className="text-lg font-bold text-gray-900 mt-3"><strong>Total Price:</strong> ₹{order.totalPrice?.toFixed(2)}</p>
            </div>

            <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Ordered Items:</h3>
                <ul className="space-y-4">
                    {order.cartItems && order.cartItems.length > 0 ? (
                        order.cartItems.map((item, index) => (
                            <li key={item._id || index} className="border p-4 rounded-md flex items-center gap-6 bg-white shadow-sm">
                                <img
                                    // Use the backend base URL for images
                                    src={item.product?.images?.[0]?.url ? `${BACKEND_BASE_URL}/uploads/${item.product.images[0].url}` : 'https://via.placeholder.com/64'}
                                    alt={item.product?.name || "Product Image"}
                                    className="w-20 h-20 object-cover rounded-md border"
                                />
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-gray-800">
                                        <strong>{item.product?.name || 'Unknown Product'}</strong>
                                    </p>
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

            {order.cartItems && order.cartItems.length > 0 && (
                <div className="mt-6 p-4 border-t-2 border-gray-200 text-right bg-white rounded-md shadow-sm">
                    <p className="text-xl font-bold text-gray-900">
                        Grand Total: ₹{order.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                    </p>
                </div>
            )}
        </div>
    );
}
