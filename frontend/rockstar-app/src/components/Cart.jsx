import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Helper function to safely get the product ID string from various formats
// This function needs to handle the _id format coming from your initial product data
// and also from the backend response where product might be { "$oid": "..." }
const getProductId = (productData) => {
    if (!productData) {
        console.warn("getProductId received null or undefined productData");
        return null;
    }
    // Handles { "$oid": "..." } format from MongoDB response or similar objects
    if (typeof productData === 'object' && productData.$oid) {
        return productData.$oid;
    }
    // Handles plain string IDs (e.g., if already converted or from product fetch)
    if (typeof productData === 'string') {
        return productData;
    }
    // Handles product objects like { _id: "someId", name: "..." }
    if (typeof productData === 'object' && productData._id) {
        // If _id itself is an object { "$oid": "..." }, extract it
        if (typeof productData._id === 'object' && productData._id.$oid) {
            return productData._id.$oid;
        }
        // Otherwise, assume _id is already a string
        return productData._id;
    }
    console.warn("getProductId: Could not extract valid ID from:", productData);
    return null; // Fallback if no valid ID is found
};

export default function Cart({ cart, setCart }) {
    const navigate = useNavigate();

    // State for customer information
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const removeItemFromCart = (productId) => {
        setCart(prevCart => {
            const updatedCart = prevCart.filter(item => getProductId(item.product) !== productId);
            toast.info("Item removed from cart!");
            return updatedCart;
        });
    };

    const updateItemQuantity = (productId, newQty) => {
        const quantity = Number(newQty);
        if (isNaN(quantity) || quantity < 0) return; // Disallow non-numeric or negative quantities

        setCart(prevCart =>
            prevCart.map(item => {
                const currentProductId = getProductId(item.product);
                if (currentProductId === productId) {
                    const availableStock = item.product.stock || Infinity;

                    if (quantity > availableStock) {
                        toast.warn(`Only ${availableStock} in stock for ${item.product.name}. Quantity limited.`);
                        return { ...item, qty: availableStock };
                    }
                    if (quantity === 0) {
                        removeItemFromCart(productId); // Remove item if quantity becomes 0
                        return null; // Mark for removal by filter(Boolean)
                    }
                    toast.info(`Quantity updated for ${item.product.name}.`);
                    return { ...item, qty: quantity };
                }
                return item;
            }).filter(Boolean) // Filter out any items marked as null for removal
        );
    };

    const handleProceedToCheckout = async () => {
        if (cart.length === 0) {
            toast.warn("Your cart is empty. Please add items before checking out.");
            return;
        }

        // Basic form validation for customer info
        if (!customerName.trim()) {
            toast.error("Please enter your name.");
            return;
        }
        if (!customerAddress.trim()) {
            toast.error("Please enter your address.");
            return;
        }
        if (!customerPhone.trim()) {
            toast.error("Please enter your phone number.");
            return;
        }

        // Prepare cart items to send to the backend, matching the `cartItemSchema`
        const orderDataForBackend = cart.map(item => {
            // Validate essential properties exist in the frontend's cart item
            if (!item.product || !item.product.name || item.product.price === undefined || item.qty === undefined) {
                console.error("Invalid cart item structure before sending to backend:", item);
                toast.error(`One or more items in your cart have missing product details (${item.product?.name || 'Unknown Product'}). Please try again.`);
                return null; // Mark as invalid
            }

            const productId = getProductId(item.product);
            if (!productId) {
                console.error("Failed to get a valid product ID for item:", item.product);
                toast.error(`Failed to get product ID for ${item.product.name || 'an item'}. Please refresh.`);
                return null; // Mark as invalid
            }

            return {
                product: productId,         // Send product ID as a string, matching your DB schema
                name: item.product.name,    // Send product name (String)
                price: parseFloat(item.product.price), // Send product price (Number)
                quantity: item.qty,         // Send quantity (Number), matching 'quantity' in DB
                size: item.size || null,    // Include size if applicable (String or null)
            };
        }).filter(Boolean); // Remove any null items (invalid ones)

        if (orderDataForBackend.length === 0) {
            toast.error("No valid items to process for the order. Please ensure your cart items are complete and refresh if needed.");
            return;
        }

        const payload = {
            cartItems: orderDataForBackend,
            amount: total.toFixed(2), // Send amount as a string to match your DB schema (if it's a string type)
            customerInfo: {
                name: customerName,
                address: customerAddress,
                phone: customerPhone,
            }
        };

        console.log("Attempting to send payload to backend:", JSON.stringify(payload, null, 2));


        let loadingToastId = null; // Declare here so it's accessible in finally block

        try {
            loadingToastId = toast.loading("Processing your order...");

            const response = await fetch('https://backend-puaq.onrender.com/api/v1/order/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log("Backend response received. Status:", response.status);

            // Check if response is not OK early to handle network/server errors more gracefully
            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    console.error("Failed to parse error response JSON:", jsonError);
                    // If JSON parsing fails, the body might be plain text or empty
                    errorData.message = `Server responded with status ${response.status} but no readable error message.`;
                }

                toast.dismiss(loadingToastId); // Dismiss loading toast on error
                const errorMessage = errorData.message || `Failed to confirm order. Server responded with status: ${response.status}. Please check your backend.`;
                toast.error(errorMessage);
                console.error("Order confirmation failed (server responded with error):", errorData);
                return; // Stop execution if response was not ok
            }

            const data = await response.json();
            toast.dismiss(loadingToastId); // Dismiss loading toast on success or final failure

            if (data.success) {
                toast.success("Order confirmed successfully! Thank you for your purchase.");

                // --- Extract values correctly from backend response (handling $oid and $date) ---
                // For order _id
                const receivedOrderId = data.order._id && data.order._id.$oid
                                        ? data.order._id.$oid
                                        : data.order._id;

                // For createdAt
                const receivedCreatedAt = data.order.createdAt && data.order.createdAt.$date
                                          ? data.order.createdAt.$date
                                          : data.order.createdAt;

                // Prepare items for success page, using the *returned* cartItems from the backend response.
                // This is vital because the backend's saved structure is authoritative.
                const itemsForSuccessPage = data.order.cartItems.map(item => ({
                    _id: getProductId(item.product), // Product ID from the DB's cartItem
                    name: item.name,                // Product Name from the DB's cartItem
                    qty: item.quantity,             // Quantity from the DB's cartItem (DB uses 'quantity')
                    size: item.size || null,        // Size from the DB's cartItem
                    price: item.price,              // Price from the DB's cartItem
                }));

                setCart([]); // Clear the cart on successful order
                setCustomerName('');
                setCustomerAddress('');
                setCustomerPhone('');

                // Navigate to OrderSuccess page, passing all necessary details in state
                navigate('/order-success', {
                    state: {
                        orderId: receivedOrderId,
                        createdAt: receivedCreatedAt, // This is the UTC string from DB
                        orderedItems: itemsForSuccessPage,
                        totalAmount: parseFloat(data.order.amount), // Parse amount back to float for frontend display
                        customerDetails: data.order.customerInfo,    // Pass customerInfo directly
                    }
                });

            } else {
                // This block handles cases where response.ok is true, but data.success is false
                const errorMessage = data.message || "Failed to confirm order due to an unexpected server response. Please try again.";
                toast.error(errorMessage);
                console.error("Order confirmation failed (data.success was false):", data);
            }
        } catch (error) {
            // This catch block handles network errors, CORS errors, or any error before response.json()
            console.error("Error during order confirmation fetch:", error);
            toast.dismiss(loadingToastId); // Dismiss loading toast on network error
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                toast.error("Network error: Could not connect to the server. Please ensure your backend is running.");
            } else if (error.message.includes("Unexpected token < in JSON at position 0")) {
                toast.error("Server returned non-JSON response. This might be a backend error page or CORS issue.");
            } else {
                toast.error("An unexpected error occurred during order confirmation. Please check console for details.");
            }
        }
    };

    // Calculate subtotal and total based on the cart state
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product?.price) || 0) * (item.qty || 0), 0);
    const shipping = 0; // Assuming free shipping for now
    const total = subtotal + shipping;

    return (
        <>
           <div style={{backgroundColor:"#F7B08C", paddingTop:"15px" ,textAlign:"center"}} className="placeing" id='section-p1'>
            <h2>Place your order, Get your Product!</h2>
             <section className="cart" id="section-p1">
               
                <table width="100%">
                    <thead>
                        <tr>
                            <td>Remove</td>
                            <td>Image</td>
                            <td>Product</td>
                            <td>Price</td>
                            <td>Quantity</td>
                            <td>Subtotal</td>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                    Your cart is currently empty. <Link to="/shop">Start shopping now!</Link>
                                </td>
                            </tr>
                        ) : (
                            cart.map(item => {
                                // Added optional chaining for product properties in rendering
                                const productId = getProductId(item.product);
                                const productPrice = parseFloat(item.product?.price) || 0;
                                const itemSubtotal = productPrice * (item.qty || 0);

                                if (!productId || !item.product?.name) {
                                    console.warn("Skipping rendering of invalid cart item:", item);
                                    return null; // Don't render invalid items
                                }

                                return (
                                    <tr key={productId}>
                                        <td>
                                            <a href="#" onClick={(e) => { e.preventDefault(); removeItemFromCart(productId); }}>
                                                <FontAwesomeIcon icon={faTrashCan} />
                                            </a>
                                        </td>
                                        <td>
                                            <img
                                                src={item.product.images && item.product.images.length > 0 ? `/${item.product.images[0].url}` : 'img/products/f1.jpg'}
                                                alt={item.product.name}
                                            />
                                        </td>
                                        <td>{item.product.name} {item.size ? `(Size: ${item.size})` : ''}</td>
                                        <td>${productPrice.toFixed(2)}</td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.qty || 0} // Ensure value is a number
                                                onChange={(e) => updateItemQuantity(productId, e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>${itemSubtotal.toFixed(2)}</td>
                                    </tr>
                                );
                            }).filter(Boolean) // Filter out any nulls from rendering
                        )}
                    </tbody>
                </table>
            </section>

            <section className="cart-add" id="section-p1">
                <div className="customer-details-and-subtotal-wrapper">
                    <div className="customer-details">
                        <h3>Customer Information</h3>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label htmlFor="customerName">Name:</label>
                                <input
                                    type="text"
                                    id="customerName"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Your Full Name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="customerAddress">Address:</label>
                                <textarea
                                    id="customerAddress"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Street, City, State, Zip Code"
                                    rows="3"
                                    required
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="customerPhone">Phone Number:</label>
                                <input
                                    type="tel"
                                    id="customerPhone"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="e.g., +91 9876543210"
                                    required
                                />
                            </div>
                        </form>
                    </div>

                    <div className="subtotal">
                        <h3>Cart Totals</h3>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Cart Subtotal</td>
                                    <td>${subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Shipping</td>
                                    <td>${shipping.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Total</strong></td>
                                    <td><strong>${total.toFixed(2)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                        <button
                            className="tot-button"
                            onClick={handleProceedToCheckout}
                            disabled={cart.length === 0 || !customerName.trim() || !customerAddress.trim() || !customerPhone.trim()}
                            style={{backgroundColor:"#35396d"}}
                        >
                            Proceed to checkout
                        </button>
                    </div>
                </div>
            </section>
           </div>
        </>
    );
}
