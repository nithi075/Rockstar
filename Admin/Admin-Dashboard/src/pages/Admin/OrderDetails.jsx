import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Import Link for product view
import api from '../../axios'; // Ensure this path is correct for your project structure

export default function OrderDetails() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get(`/orders/admin/orders/${orderId}`)
            .then(res => {
                setOrder(res.data.order);
            })
            .catch(err => {
                console.error("Failed to fetch order details", err);
                setError("Failed to load order details: " + (err.response?.data?.message || err.message || "Network error occurred.")); // Improved error message
            });
    }, [orderId]);

    if (error) return <div className="p-4 text-red-500 font-bold">{error}</div>;
    if (!order) return <div className="p-4 text-gray-600">Loading order details...</div>;

    return (
        <div className="p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Order Details</h2>

            <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <p className="mb-2"><strong>Order ID:</strong> <span className="font-mono text-sm text-gray-700">{order._id}</span></p>
                {/* Corrected: Access user and shippingInfo directly */}
                <p className="mb-2"><strong>Customer Name:</strong> {order.user?.name || 'N/A'}</p>
                <p className="mb-2"><strong>Customer Email:</strong> {order.user?.email || 'N/A'}</p>
                <p className="mb-2"><strong>Phone:</strong> {order.shippingInfo?.phoneNo || 'N/A'}</p>
                <p className="mb-2"><strong>Address:</strong>
                    {order.shippingInfo ? (
                        `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state}, ${order.shippingInfo.pinCode}, ${order.shippingInfo.country}`
                    ) : 'N/A'}
                </p>
                <p className="mb-2"><strong>Order Status:</strong>
                    <span className={`font-semibold ${
                        order.orderStatus === "Delivered" ? "text-green-600" :
                        order.orderStatus === "Processing" ? "text-blue-600" :
                        "text-yellow-600"
                    }`}>
                        {order.orderStatus}
                    </span>
                </p>
                <p className="mb-2"><strong>Ordered At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                {order.deliveredAt && <p className="mb-2"><strong>Delivered At:</strong> {new Date(order.deliveredAt).toLocaleString()}</p>}
            </div>

            <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Payment Information</h3>
                <p className="mb-2"><strong>Payment ID:</strong> <span className="font-mono text-sm text-gray-700">{order.paymentInfo?.id || 'N/A'}</span></p>
                <p className="mb-2"><strong>Payment Status:</strong>
                    <span className={`font-semibold ${
                        order.paymentInfo?.status === "succeeded" ? "text-green-600" : "text-red-600"
                    }`}>
                        {order.paymentInfo?.status || 'N/A'}
                    </span>
                </p>
            </div>

            <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Pricing Summary</h3>
                <p className="mb-2"><strong>Items Price:</strong> ₹{order.itemsPrice?.toFixed(2)}</p>
                <p className="mb-2"><strong>Tax Price:</strong> ₹{order.taxPrice?.toFixed(2)}</p>
                <p className="mb-2"><strong>Shipping Price:</strong> ₹{order.shippingPrice?.toFixed(2)}</p>
                <p className="text-lg font-bold text-gray-900"><strong>Total Price:</strong> ₹{order.totalPrice?.toFixed(2)}</p>
            </div>

            <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Order Items:</h3>
                <ul className="space-y-4">
                    {/* Corrected: Use 'orderItems' array from the backend response */}
                    {order.orderItems && order.orderItems.length > 0 ? (
                        order.orderItems.map((item, index) => (
                            <li key={index} className="border p-4 rounded-md flex items-center gap-6 bg-white shadow-sm">
                                {/* Image access: Prioritize product.images array, then item.image (direct string) */}
                                <img
                                    src={item.product?.images?.[0]?.url || item.image || 'https://via.placeholder.com/64'} // Fallback to a placeholder image
                                    alt={item.product?.name || item.name}
                                    className="w-20 h-20 object-cover rounded-md border"
                                />
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">
                                        <strong>{item.product?.name || item.name}</strong>
                                    </p>
                                    {/* Removed 'Size' as it's not in your schema */}
                                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                                    <p className="text-gray-700">Price: ₹{(item.price * item.quantity).toFixed(2)} (<span className="font-medium">₹{item.price?.toFixed(2)}/item</span>)</p>
                                    {item.product?._id && ( // Optional: Link to product details if ID exists
                                        <Link to={`/admin/product/${item.product._id}`} className="text-blue-500 hover:underline text-sm">
                                            View Product
                                        </Link>
                                    )}
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-600">No items in this order.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}
