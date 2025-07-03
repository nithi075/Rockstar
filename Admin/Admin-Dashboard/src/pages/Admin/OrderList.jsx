import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios"; // custom axios with baseURL
import { toast } from "react-toastify";

const BACKEND_IMAGE_URL = "https://admin-backend-x8of.onrender.com/uploads";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async (page = 1) => {
    try {
      const res = await api.get(`/admin/orders?page=${page}`);
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-red-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Size</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) =>
                order.cartItems.map((item, index) => (
                  <tr key={`${order._id}-${index}`} className="border-t">
                    <td className="px-4 py-2">
                      <img
                        src={`${BACKEND_IMAGE_URL}/Products/${item.product?.images?.[0] || "placeholder.jpg"}`}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.size}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-indigo-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
