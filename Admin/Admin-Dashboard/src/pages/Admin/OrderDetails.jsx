import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../../axios'; // Correct import of your custom axios instance

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // CHANGE axios.get TO api.get
    api.get(`/admin/orders/${orderId}`) // <-- CORRECTED LINE
      .then(res => {
        setOrder(res.data.order);
      })
      .catch(err => {
        console.error("Failed to fetch order details", err);
        setError("Failed to load order details");
      });
  }, [orderId]);

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!order) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
      <div className="mb-4">
        <strong>Order ID:</strong> {order._id}
        <br />
        <strong>Customer:</strong> {order.customerInfo?.name}
        <br />
        <strong>Phone:</strong> {order.customerInfo?.phone}
        <br />
        <strong>Address:</strong> {order.customerInfo?.address}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Items:</h3>
        <ul className="space-y-3">
          {order.cartItems.map((item, index) => (
            <li key={index} className="border p-2 rounded flex items-center gap-4">
              <img src={item.product?.image} alt={item.product?.name} className="w-16 h-16 object-cover" />
              <div>
                <p><strong>{item.product?.name}</strong></p>
                <p>Size: {item.size}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ₹{item.product?.price}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
