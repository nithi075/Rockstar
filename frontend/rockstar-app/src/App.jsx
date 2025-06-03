// App.jsx
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import all your components
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './components/Home.jsx';
import Shop from './components/Shop.jsx';
import Contact from './components/Contact.jsx';
import Cart from './components/Cart.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import OrderSuccess from './components/OrderSuccess.jsx';


// Helper function to safely get the product ID string
const getProductId = (productData) => {
    if (!productData || !productData._id) {
        return null;
    }
    if (typeof productData._id === 'object' && productData._id.$oid) {
        return productData._id.$oid;
    }
    if (typeof productData._id === 'string') {
        return productData._id;
    }
    return null;
};

function App() {
    const [cart, setCart] = useState([]);

    const addProductToCart = (productToAdd, quantity = 1, selectedSize = '') => {
        const productToAddId = getProductId(productToAdd);
        if (!productToAddId) {
            console.error("Attempted to add a product without a valid ID:", productToAdd);
            return;
        }

        setCart(prevCart => {
            const existingItem = prevCart.find(item => {
                const itemProductId = getProductId(item.product);
                // Check both product ID and selected size for uniqueness in cart
                return itemProductId === productToAddId && item.size === selectedSize;
            });

            if (existingItem) {
                return prevCart.map(item =>
                    (getProductId(item.product) === productToAddId && item.size === selectedSize)
                        ? { ...item, qty: item.qty + quantity }
                        : item
                );
            } else {
                return [...prevCart, { product: productToAdd, qty: quantity, size: selectedSize }];
            }
        });
    };

    const cartItemCount = cart.reduce((totalQty, item) => totalQty + item.qty, 0);

    console.log("App.jsx State - Current Cart:", cart);
    console.log("App.jsx State - Cart Item Count (badge value - sum of quantities):", cartItemCount);

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <Header cartItemCount={cartItemCount} />

            <Routes>
                <Route path="/" element={<Home />} />

                {/* Shop route for all products, also handles search and category queries */}
                {/* It's crucial that /shop handles all filtering via query parameters now */}
                <Route
                    path="/shop"
                    element={<Shop addProductToCart={addProductToCart} />}
                />
                {/* If you have a dedicated search page URL, keep this, otherwise /shop is sufficient */}
                {/* <Route path="/search" element={<Shop addProductToCart={addProductToCart} />} /> */}

                {/* REMOVE OR COMMENT OUT THIS ROUTE:
                    The category filtering is now handled by /shop?category=XYZ
                    This route is no longer needed as Shop.jsx uses useSearchParams, not useParams, for categories.
                */}
                {/* <Route
                    path="/products/category/:categoryName"
                    element={<Shop addProductToCart={addProductToCart} />}
                /> */}

                <Route
                    path="/cart"
                    element={<Cart cart={cart} setCart={setCart} />}
                />
                <Route
                    path="/product/:id"
                    element={<ProductDetail cart={cart} setCart={setCart} />}
                />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>

            <Footer />
        </>
    );
}

export default App;