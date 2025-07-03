import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios";

export default function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await api.get("/orders/admin/orders");

                // Keep the mapping to cartItems for compatibility with your existing rendering logic
                const formatted = res.data.orders.map(order => ({
                    ...order,
                    cartItems: order.orderItems, // Ensure this array exists
                }));

                setOrders(formatted);
            } catch (err) {
                console.error("Failed to fetch orders", err);
                setError(
                    "Failed to fetch orders. " +
                    (err.response?.data?.message || err.message || "Network Error occurred.")
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleMarkAsDelivered = async (orderId) => {
        try {
            // Corrected: Added 'admin/orders' to the PUT request path
            await api.put(`/orders/admin/orders/${orderId}/deliver`, {
                status: "Delivered",
            });

            // Update state to reflect the change
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === orderId
                        ? { ...order, orderStatus: "Delivered", deliveredAt: new Date().toISOString() } // Set deliveredAt for consistency
                        : order
                )
            );

            alert("Order marked as delivered!");
        } catch (err) {
            alert(
                "Failed to update status. " +
                (err.response?.data?.message || err.message || "Unknown error occurred.")
            );
        }
    };

    const calculateTotalAmount = (cartItems) =>
        cartItems
            .reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0) // Added null checks for price/quantity
            .toFixed(2);

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const paginate = (page) => setCurrentPage(page);

    if (loading) return <p className="Load-order text-gray-600 p-4">Loading orders...</p>;
    if (error) return <p className="error-order text-red-500 font-bold p-4">{error}</p>;

    return (
        <div className="Order-details p-4 bg-white shadow-lg rounded-lg">
            <h1 className="o-list text-3xl font-bold mb-6 text-gray-800">Order List</h1>

            {orders.length === 0 ? (
                <p className="text-gray-600 p-4">No orders found.</p>
            ) : (
                <div className="pro-order-list overflow-x-auto"> {/* Added overflow-x-auto for better table responsiveness */}
                    <table className="order-table min-w-full leading-normal">
                        <thead className="order-table-list bg-gray-200">
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Image</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Name</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Items</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map((order) => (
                                <tr key={order._id} className="details-order hover:bg-gray-100">
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {/* Removed customId as it's not in your schema */}
                                        <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:underline font-mono">
                                            {order._id.substring(0, 10)}...
                                        </Link>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {order.cartItems?.[0] && (order.cartItems[0].product?.images?.[0]?.url || order.cartItems[0].image) ? (
                                            <img
                                                src={
                                                    order.cartItems[0].product?.images?.[0]?.url || // Prioritize populated product image
                                                    order.cartItems[0].image // Fallback to image directly on order item
                                                }
                                                alt={order.cartItems[0].name || "Product Image"}
                                                className="w-16 h-16 object-cover rounded-md"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md text-xs text-gray-500">No Image</div>
                                        )}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {/* Corrected: Access user.name */}
                                        <span className="text-gray-900 whitespace-no-wrap">{order.user?.name || "N/A"}</span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className="text-gray-900 whitespace-no-wrap">{order.cartItems?.length || 0}</span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className="text-gray-900 whitespace-no-wrap">₹{calculateTotalAmount(order.cartItems || [])}</span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span
                                            className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${
                                                order.orderStatus === "Delivered"
                                                    ? "text-green-900 bg-green-200"
                                                    : order.orderStatus === "Cancelled"
                                                    ? "text-red-900 bg-red-200"
                                                    : "text-blue-900 bg-blue-200"
                                            }`}
                                        >
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold"
                                            >
                                                View
                                            </Link>
                                            {order.orderStatus !== "Delivered" &&
                                                order.orderStatus !== "Cancelled" && (
                                                    <button
                                                        onClick={() => handleMarkAsDelivered(order._id)}
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                                                    >
                                                        Delivered
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="pagination flex justify-center mt-4 space-x-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`px-4 py-2 rounded-md border ${
                                        currentPage === i + 1
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-blue-600 border-gray-300 hover:bg-gray-100"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
