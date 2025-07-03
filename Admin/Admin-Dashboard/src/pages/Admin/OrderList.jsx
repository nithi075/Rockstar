import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../../axios";



export default function OrderList() {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  useEffect(() => {

    const fetchOrders = async () => {

      try {

        const res = await api.get("/admin/orders");

        setOrders(res.data.orders || []);

      } catch (err) {

        console.error("Error fetching orders: ", err);

        setError("Failed to fetch orders.");

      } finally {

        setLoading(false);

      }

    };



    fetchOrders();

  }, []);



  if (loading) return <p className="p-4">Loading...</p>;

  if (error) return <p className="p-4 text-red-500">{error}</p>;



  return (

    <div className="p-4">

      <h1 className="text-xl font-bold mb-4">Orders</h1>

      <div className="overflow-x-auto">

        <table className="min-w-full bg-white border border-gray-200">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-2 border">Image</th>

              <th className="p-2 border">Product Name</th>

              <th className="p-2 border">Size</th>

              <th className="p-2 border">Price</th>

              <th className="p-2 border">Quantity</th>

              <th className="p-2 border">Status</th>

              <th className="p-2 border">Action</th>

            </tr>

          </thead>

          <tbody>

            {orders.length === 0 ? (

              <tr>

                <td colSpan="7" className="text-center py-4 text-gray-500">

                  No orders found.

                </td>

              </tr>

            ) : (

              orders.map((order) =>

                order.cartItems.map((item, idx) => {

                  const imageUrl =

                    item.product?.images?.[0]?.url

                      ? `https://admin-backend-x8of.onrender.com/uploads/${item.product.images[0].url}`

                      : "/placeholder.jpg"; // fallback image



                  return (

                    <tr key={order._id + "-" + idx} className="border-t">

                      <td className="p-2 border">

                        <img

                          width={50}

                          src={imageUrl}

                          alt={item.name}

                          className="w-16 h-16 object-cover rounded"

                        />

                      </td>

                      <td className="p-2 border">{item.name}</td>

                      <td className="p-2 border">{item.size}</td>

                      <td className="p-2 border">₹{item.price}</td>

                      <td className="p-2 border">{item.quantity}</td>

                      <td className="p-2 border">{order.orderStatus}</td>

                      <td className="p-2 border">

                        <Link

                          to={`/admin/orders/${order._id}`}

                          className="text-blue-500 underline"

                        >

                          View

                        </Link>

                      </td>

                    </tr>

                  );

                })

              )

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}
