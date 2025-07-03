import { useEffect, useState } from "react";
import axios from "../../axios"; // ✅ Corrected import
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/admin/orders?page=${page}`);
      setOrders(data.orders);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, success]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/v1/admin/orders/${orderId}`, {
        status: newStatus,
      });
      setSuccess(!success); // trigger re-fetch
    } catch (err) {
      setError("Failed to update status.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "text-green-600 font-semibold";
      case "Pending":
        return "text-yellow-600 font-semibold";
      case "Cancelled":
        return "text-red-600 font-semibold";
      default:
        return "";
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <table className="min-w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const product = order.cartItems?.[0]?.product;
                const imageUrl = product?.images?.[0]?.url;

                return (
                  <tr key={order._id} className="border-t">
                    <td className="px-4 py-2">{order._id}</td>
                    <td className="px-4 py-2">
                      {imageUrl ? (
                        <img
                          src={`https://admin-backend-x8of.onrender.com/uploads/${imageUrl}`}
                          alt={product?.name || "Product"}
                          width={50}
                          height={50}
                          className="rounded"
                        />
                      ) : (
                        <img
                          src="/placeholder.jpg"
                          alt="No product"
                          width={50}
                          height={50}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td className="px-4 py-2">{product?.name || "N/A"}</td>
                    <td className="px-4 py-2">₹{order.totalAmount}</td>
                    <td className={`px-4 py-2 ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </td>
                    <td className="px-4 py-2">{order.customerInfo?.name || "N/A"}</td>
                    <td className="px-4 py-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value)
                        }
                        className="border px-2 py-1 rounded"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <Link
                        to={`/admin/order/${order._id}`}
                        className="text-blue-600 underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
