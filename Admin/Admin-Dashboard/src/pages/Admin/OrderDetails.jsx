import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/admin/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order details", err);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) return <div className="p-4">Loading order details...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Order Details</h1>

      <div className="mb-4">
        <p><strong>Customer:</strong> {order.customerInfo?.name}</p>
        <p><strong>Email:</strong> {order.customerInfo?.email}</p>
        <p><strong>Phone:</strong> {order.customerInfo?.phone}</p>
        <p><strong>Address:</strong> {order.customerInfo?.address}</p>
        <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Product</th>
            <th className="p-2">Image</th>
            <th className="p-2">Size</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.cartItems.map((item, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{item.product?.name}</td>
              <td className="p-2">
                {item.product?.images?.[0] && (
                  <img src={item.product.images[0]} alt="" className="h-12 w-12 object-cover" />
                )}
              </td>
              <td className="p-2">{item.size}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">₹{item.product?.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
