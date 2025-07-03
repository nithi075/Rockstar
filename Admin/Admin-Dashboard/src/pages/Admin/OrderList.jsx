import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios"; // Custom axios instance
import { toast } from "react-toastify";

const BACKEND_BASE_URL = "https://admin-backend-x8of.onrender.com";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (page = 1) => {
    try {
      const res = await api.get(`/api/v1/admin/orders?page=${page}`);
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Image</th>
                <th className="py-3 px-6 text-left">Product Name</th>
                <th className="py-3 px-6 text-left">Customer</th>
                <th className="py-3 px-6 text-left">Size</th>
                <th className="py-3 px-6 text-left">Amount</th>
                <th className="py-3 px-6 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {orders.map((order) => {
                const cartItem = order.cartItems?.[0];
                const product = cartItem?.product;
                const imagePath = product?.images?.[0]?.url || "";
                let correctedImageUrl = "";

                if (imagePath.startsWith("/uploads/")) {
                  correctedImageUrl = imagePath;
                } else {
                  correctedImageUrl = `/uploads/${imagePath}`;
                }

                return (
                  <tr
                    key={order._id}
                    className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                  >
                    <td className="py-3 px-6 text-left">
                      <Link to={`/admin/orders/${order._id}`}>
                        <img
                          src={`${BACKEND_BASE_URL}${correctedImageUrl}`}
                          alt={product?.name || "Product"}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      </Link>
                    </td>
                    <td className="py-3 px-6">
                      <Link to={`/admin/orders/${order._id}`}>
                        {product?.name || "N/A"}
                      </Link>
                    </td>
                    <td className="py-3 px-6">{order.customerInfo?.name || "N/A"}</td>
                    <td className="py-3 px-6">{cartItem?.size || "N/A"}</td>
                    <td className="py-3 px-6">₹{cartItem?.price || "0"}</td>
                    <td className="py-3 px-6">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-2">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
