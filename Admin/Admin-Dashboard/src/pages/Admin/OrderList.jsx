import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios"; // Your custom axios instance
import { toast } from "react-toastify";

const BACKEND_BASE_URL = "https://admin-backend-x8of.onrender.com"; // Replace with localhost if testing locally

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/api/v1/orders?page=${currentPage}`);
        setOrders(res.data.orders || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
        toast.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Order List</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-2">Order ID</th>
              <th className="p-2">Image</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const productImage = order.cartItems[0]?.product?.image;
              const fullImageUrl = productImage
                ? `${BACKEND_BASE_URL}/${productImage.replace(/\\/g, "/")}`
                : "";

              return (
                <tr key={order._id} className="border-t border-gray-200">
                  <td className="p-2">{order._id}</td>
                  <td className="p-2">
                    {fullImageUrl ? (
                      <img
                        src={fullImageUrl}
                        alt="product"
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      "No image"
                    )}
                  </td>
                  <td className="p-2">{order.customerInfo?.name || "N/A"}</td>
                  <td className="p-2">₹{order.amount}</td>
                  <td className="p-2 capitalize">{order.status}</td>
                  <td className="p-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <Link
                      to={`/admin/orders/${order._id}`}
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
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 gap-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
