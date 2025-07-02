import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios"; // ✅ Use shared Axios instance

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
                // Ensure this endpoint matches your backend route for fetching all orders
                const res = await api.get("/orders/admin/orders");
                const sortedOrders = (res.data.orders || []).sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setOrders(sortedOrders);
            } catch (err) {
                console.error("Failed to fetch orders", err);
                setError("Failed to fetch orders. " + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleMarkAsDelivered = async (orderId) => {
        try {
            // This endpoint corresponds to the backend updateOrderDeliverStatus
            const res = await api.put(`/orders/${orderId}/deliver`, { status: 'Delivered' });
            if (res.data.success) {
                 setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId ? { ...order, orderStatus: 'Delivered', deliveredAt: new Date() } : order // Update orderStatus
                    )
                );
                alert("Order marked as delivered successfully!");
            } else {
                 alert("Failed to update status: " + (res.data.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update status. " + (err.response?.data?.message || err.message));
        }
    };

    // Calculate total amount based on order.totalPrice from backend, or fall back to calculation
    const calculateTotalAmount = (order) => {
        if (order.totalPrice !== undefined) {
            return order.totalPrice.toFixed(2);
        }
        // Fallback calculation if totalPrice is not directly available (less ideal)
        return (order.orderItems || []).reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
    };


    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const paginate = (page) => setCurrentPage(page);

    if (loading) return <p className="Load-order">Loading orders...</p>;
    if (error) return <p className="error-order">{error}</p>;

    return (
        <div className="Order-details">
            <h1 className="o-list">Order List</h1>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div className="pro-order-list">
                    <table className="order-table">
                        <thead className="order-table-list">
                            <tr>
                                <th className="order-id-header">Order ID</th>
                                <th className="order-pro-img">Product Image</th>
                                <th className="order-cust-name">Customer Name</th>
                                <th className="order-list">Total Items</th>
                                <th className="order-total-amount">Total Amount</th>
                                <th className="order-status">Status</th>
                                <th className="order-action">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map((order) => {
                                // Get the first product image from orderItems, similar to ProductList
                                const firstProductImage = order.orderItems?.[0]?.product?.images?.[0]?.url;
                                const imageUrl = firstProductImage
                                    ? `https://admin-backend-x8of.onrender.com/uploads/${firstProductImage}`
                                    : "/placeholder.jpg"; // Fallback placeholder

                                return (
                                    <tr key={order._id} className="details-order">
                                        <td className="order-id">
                                            {order.customId ? order.customId : order._id.substring(0, 10) + '...'}
                                        </td>
                                        <td className="order-img">
                                            {firstProductImage ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={order.orderItems[0].product?.name || "Product Image"}
                                                    className="ord-img"
                                                />
                                            ) : (
                                                <div className="order-no-img">No Image</div>
                                            )}
                                        </td>
                                        {/* Corrected: Access user name from populated 'user' field */}
                                        <td className="order-info-name">{order.user?.name || 'N/A'}</td>
                                        {/* Corrected: Use orderItems for total items */}
                                        <td className="order-length-cartitems">{order.orderItems?.length || 0}</td>
                                        {/* Using calculateTotalAmount function */}
                                        <td className="cart-total-amount">₹{calculateTotalAmount(order)}</td>
                                        <td className="order-status">
                                            <span
                                                className={`order-current-status ${
                                                    order.orderStatus === "Delivered"
                                                        ? "deliverd-order"
                                                        : order.orderStatus === "Cancelled"
                                                        ? "cancelled-order"
                                                        : "bg-blue-100 text-blue-800" // Default/Pending style
                                                }`}
                                            >
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="order-action-cell">
                                            <div className="order-admin">
                                                <Link to={`/admin/orders/${order._id}`} className="order-view">
                                                    View
                                                </Link>
                                                {/* Button to mark as delivered, only if not already Delivered or Cancelled */}
                                                {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                                                    <button
                                                        onClick={() => handleMarkAsDelivered(order._id)}
                                                        className="order-delivered"
                                                    >
                                                        Delivered
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`page-number ${
                                        currentPage === i + 1 ? "more-than-one" : "less-than-one"
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
