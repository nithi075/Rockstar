// E:\Rockstar\rockstar-app-nextjs\src\app\product\[id]\page.jsx

"use client"; // This component uses client-side hooks

import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image'; // For optimized images in Next.js
import { useParams } from 'next/navigation'; // To get the dynamic ID from URL

// Import Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faStar, faShareAlt } from '@fortawesome/free-solid-svg-icons';

// --- Utility function (can be moved to a separate file like src/lib/utils.js) ---
const getProductId = (productData) => {
    if (!productData || !productData._id) return null;
    if (typeof productData._id === 'object' && productData._id.$oid) return productData._id.$oid;
    if (typeof productData._id === 'string') return productData._id;
    return null;
};

// --- Your Backend API Base URL ---
const BACKEND_URL = 'https://backend-puaq.onrender.com'; // Use your actual backend URL
// --- End Backend API Base URL ---

// --- generateMetadata function (for SEO and Social Media Previews) ---
// NOTE: This runs on the server. If this component is entirely 'use client',
// Next.js will ignore this generateMetadata function in this file.
// For true server-side metadata generation, this typically resides in a layout.js
// or a parent server component that then passes data to the client component.
// However, for simplicity and to include it as per your original structure,
// we'll keep it here, noting that Next.js might process it differently
// if the whole file is marked as "use client".
// A better approach for client components needing dynamic metadata is to
// fetch it on the server in a parent component and pass it down, or
// use client-side approaches like React Helmet (though not ideal for Next.js app router).

export async function generateMetadata({ params }) {
    const id = params.id; // Get the product ID from the URL

    let product = null;
    try {
        // Fetch data directly here for metadata generation (server-side)
        const response = await fetch(`${BACKEND_URL}/api/v1/products/${id}`, { cache: 'no-store' }); // Ensure fresh data
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                product = data.product;
            }
        }
    } catch (error) {
        console.error("Error fetching product for metadata:", error);
    }

    const defaultTitle = 'ROCKSTAR - Your Ultimate Fashion Destination';
    const defaultDescription = 'Discover the latest trends in fashion and accessories. Shop now at ROCKSTAR.';
    const defaultImageUrl = '/default-share-image.jpg'; // Path to your default share image in public folder
    const frontendBaseUrl = 'https://rockstar-fcga.onrender.com'; // Your actual deployed frontend URL

    const title = product ? `${product.name} - ROCKSTAR` : defaultTitle;
    const description = product ? product.description : defaultDescription;
    const imageUrl = product && product.images && product.images.length > 0
        ? `${frontendBaseUrl}/${product.images[0].url}` // Assuming images are served from public folder or directly accessible
        : `${frontendBaseUrl}${defaultImageUrl}`;
    const canonicalUrl = `${frontendBaseUrl}/product/${id}`;

    return {
        title: title,
        description: description,
        icons: {
            icon: '/favicon.ico', // Assuming you have a favicon in your public folder
        },
        openGraph: {
            title: title,
            description: description,
            url: canonicalUrl,
            siteName: 'ROCKSTAR',
            images: [
                {
                    url: imageUrl,
                    width: 1200, // Optimal width for OG images
                    height: 630, // Optimal height for OG images
                    alt: title,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            site: '@rockstar_fashion',
            creator: '@rockstar_fashion',
            title: title,
            description: description,
            images: [imageUrl],
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };
}
// --- End generateMetadata ---


// --- Product Detail Page Component ---
export default function ProductDetailPage({ cart, setCart }) { // Added cart and setCart props if you intend to pass them
    const { id } = useParams(); // Get the dynamic 'id' from the URL
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(''); // State for current main image
    const [smallImages, setSmallImages] = useState([]); // State for small product images
    const [selectedSize, setSelectedSize] = useState('');
    const [currentSizeStock, setCurrentSizeStock] = useState(0);

    const [allProducts, setAllProducts] = useState([]); // For "More Colors" and "You might also like"
    const [loadingAll, setLoadingAll] = useState(true);
    const [errorAll, setErrorAll] = useState(null);
    const [sameCustomIdProducts, setSameCustomIdProducts] = useState([]);

    // Function to handle adding product to cart (replace with your actual cart logic)
    const addToCart = () => {
        if (!product) {
            console.warn("addToCart: No product data to add to cart. Product is null.");
            toast.error("Product data not loaded. Please try again.");
            return;
        }
        if (quantity < 1) {
            console.warn("addToCart: Quantity must be at least 1.");
            toast.warn("Quantity must be at least 1.");
            return;
        }
        if (!selectedSize) {
            toast.warn("Please select a size.");
            return;
        }

        const selectedSizeObject = product.sizes.find(s => s.size === selectedSize);

        if (!selectedSizeObject || selectedSizeObject.stock === 0) {
            toast.error(`The selected size (${selectedSize}) is currently out of stock.`);
            return;
        }

        if (quantity > selectedSizeObject.stock) {
            toast.warn(`Cannot add ${quantity} of size ${selectedSize}. Only ${selectedSizeObject.stock} available.`);
            setQuantity(selectedSizeObject.stock);
            return;
        }

        const currentProductId = getProductId(product);
        if (!currentProductId) {
            console.error("addToCart: Could not determine valid product ID for current product:", product);
            toast.error("Could not add to cart due to product ID error.");
            return;
        }

        // --- IMPORTANT: Integrate your actual cart context/state management here ---
        // This example assumes 'cart' and 'setCart' are passed as props from a parent.
        // If using Redux, Zustand, or Context API, adjust accordingly.
        if (setCart) { // Check if setCart prop is provided
            setCart((prevCart) => {
                const existingItem = prevCart.find(item => {
                    const itemProductId = getProductId(item.product);
                    return itemProductId === currentProductId && item.size === selectedSize;
                });

                if (existingItem) {
                    if (existingItem.qty + quantity > selectedSizeObject.stock) {
                        toast.warn(`Adding ${quantity} more would exceed stock for size ${selectedSize}. You already have ${existingItem.qty} in cart. Max available: ${selectedSizeObject.stock}`);
                        return prevCart;
                    }
                    const updatedCart = prevCart.map(item =>
                        (getProductId(item.product) === currentProductId && item.size === selectedSize)
                            ? { ...item, qty: item.qty + quantity }
                            : item
                    );
                    toast.success(`Updated quantity for ${product.name} (Size: ${selectedSize}) in cart!`);
                    return updatedCart;
                } else {
                    const newCart = [...prevCart, { product, qty: quantity, size: selectedSize }];
                    toast.success(`${product.name} (Size: ${selectedSize}, Qty: ${quantity}) added to cart!`);
                    return newCart;
                }
            });
        } else {
            // Fallback toast if cart management isn't set up via props
            toast.success(`${quantity} x ${product.name} (Size: ${selectedSize}) added to cart! (No global cart update)`);
        }
    };

    // Function to handle clicking on small images
    const handleSmallImgClick = (imagePath) => {
        setMainImage(imagePath);
    };

    // Utility to extract base custom ID for "More Colors"
    const getBaseCustomId = (customId) => {
        if (!customId) return null;
        const match = customId.match(/^(.*?)([_.-]?\d+)$/);
        return match ? match[1] : customId;
    };

    // Fetch single product details
    useEffect(() => {
        const fetchProductDetails = async (productId) => {
            setLoading(true);
            setError(null);
            try {
                // Changed from /products to /product based on your console log in the original code
                const response = await fetch(`${BACKEND_URL}/api/v1/product/${productId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success && data.product) {
                    setProduct(data.product);
                    // Set main image
                    setMainImage(data.product.images && data.product.images.length > 0 ? `/${data.product.images[0].url}` : '/products/f1.jpg');
                    setSmallImages(data.product.images.map(img => `/${img.url}`));

                    // Set initial selected size and stock
                    if (data.product.sizes && data.product.sizes.length > 0) {
                        const firstAvailableSize = data.product.sizes.find(s => s.stock > 0);
                        if (firstAvailableSize) {
                            setSelectedSize(firstAvailableSize.size);
                            setCurrentSizeStock(firstAvailableSize.stock);
                        } else {
                            setSelectedSize('');
                            setCurrentSizeStock(0);
                        }
                    } else {
                        setSelectedSize('');
                        setCurrentSizeStock(0);
                    }
                    setQuantity(1); // Reset quantity when product changes
                } else {
                    setError(data.message || 'Product not found');
                    setProduct(null);
                    setSelectedSize('');
                    setCurrentSizeStock(0);
                }
            } catch (err) {
                console.error('Error fetching product details:', err);
                setError('Failed to fetch product details.');
                setProduct(null);
                setSelectedSize('');
                setCurrentSizeStock(0);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetails(id);
        }
    }, [id]); // Re-run effect if ID changes

    // Update current stock and quantity when selected size changes
    useEffect(() => {
        if (product && selectedSize) {
            const sizeObj = product.sizes.find(s => s.size === selectedSize);
            const newStock = sizeObj ? sizeObj.stock : 0;
            setCurrentSizeStock(newStock);

            setQuantity(prevQty => {
                if (newStock === 0) return 0; // If new size is out of stock, quantity becomes 0
                if (prevQty === 0) return 1; // If quantity was 0, reset to 1 if stock is available
                return Math.min(prevQty, newStock); // Ensure quantity doesn't exceed new stock
            });
        } else {
            setCurrentSizeStock(0);
            setQuantity(0); // If no size selected or no product, quantity is 0
        }
    }, [selectedSize, product]);

    // Fetch all products for "More Colors" and "You might also like"
    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoadingAll(true);
            setErrorAll(null);
            try {
                const response = await fetch(`${BACKEND_URL}/api/v1/products`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success && data.products) {
                    setAllProducts(data.products);
                }
            } catch (err) {
                setErrorAll('Failed to load all products');
                console.error('Error fetching all products:', err);
            } finally {
                setLoadingAll(false);
            }
        };

        fetchAllProducts();
    }, []);

    // Filter products for "More Colors" based on customId
    useEffect(() => {
        if (product && allProducts.length > 0) {
            const currentBaseCustomId = getBaseCustomId(product.customId);

            if (currentBaseCustomId) {
                const productsWithSameBaseCustomId = allProducts.filter(p =>
                    p.customId && getBaseCustomId(p.customId) === currentBaseCustomId
                );
                productsWithSameBaseCustomId.sort((a, b) => a.name.localeCompare(b.name));
                setSameCustomIdProducts(productsWithSameBaseCustomId);
            } else {
                setSameCustomIdProducts([]);
            }
        } else {
            setSameCustomIdProducts([]);
        }
    }, [product, allProducts]);

    // Handle clicking on "More Colors" thumbnails (navigates to new product page)
    const handleColorThumbnailClick = (clickedProduct) => {
        const clickedProductId = getProductId(clickedProduct);
        const currentProductId = getProductId(product);

        if (clickedProductId === currentProductId) {
            console.log("Clicked on the current product's color option. No navigation needed.");
            return;
        }

        // In Next.js App Router, you'd typically use `router.push()` from `next/navigation`
        // For simplicity and immediate effect in a client component, we'll use window.location.href.
        // If you were using `pages` router, you'd use `useRouter().push()`.
        window.location.href = `/product/${clickedProductId}`; // Navigates to the new product page
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top after navigation
    };

    // Handle product sharing
    const handleShareProduct = async () => {
        if (!product || !id) {
            toast.error("Product information not available to share.");
            return;
        }

        const frontendBaseUrl = 'https://rockstar-fcga.onrender.com'; // **IMPORTANT: Replace with your actual deployed frontend URL**
        const productShareUrl = `${frontendBaseUrl}/product/${id}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: product.name,
                    text: `Check out this amazing product: ${product.name} - ${product.description}`,
                    url: productShareUrl,
                });
                toast.success("Product shared successfully!");
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(productShareUrl);
                toast.success("Product link copied to clipboard!");
            } else {
                prompt("Copy this link to share:", productShareUrl);
            }
        } catch (error) {
            console.error("Error sharing product:", error);
            if (error.name !== 'AbortError') { // Check if the user simply cancelled the share
                toast.error("Failed to share product.");
            } else {
                console.log("Product sharing aborted by user.");
            }
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading product...</div>;
    }

    if (error || !product) {
        return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error || "Product not found."}</div>;
    }

    const currentProductBaseIdForRelated = getBaseCustomId(product.customId);
    const desiredCount = 8; // Number of "You Might Also Like" products to display

    // Filter out the current product and any product that shares its baseCustomId
    const unrelatedProducts = allProducts.filter(p => {
        const pId = getProductId(p);
        const currentId = getProductId(product);
        const pBaseCustomId = getBaseCustomId(p.customId);
        return pId !== currentId && pBaseCustomId !== currentProductBaseIdForRelated;
    });

    // Randomly select products from the filtered list to fill the desired count
    const productsToDisplay = [...unrelatedProducts].sort(() => 0.5 - Math.random()).slice(0, desiredCount);

    return (
        <div className="product-detail-page">
            <section className="pro-detail" id="section-p1">
                <div className="single-pro-image">
                    <div className="image-wrapper">
                        {mainImage && (
                            <Image
                                src={mainImage}
                                alt={product.name}
                                id="MainImg"
                                width={500} // Set appropriate width for larger image
                                height={500} // Set appropriate height for larger image
                                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                                priority // Prioritize loading for LCP
                            />
                        )}
                    </div>
                    {/* Only show small images if there's more than one */}
                    {smallImages && smallImages.length > 1 && (
                        <div className="small-img-group">
                            {smallImages.map((imgUrl, index) => (
                                <div className="small-img-col" key={index}>
                                    <Image
                                        src={imgUrl}
                                        width={80} // Set appropriate width for thumbnails
                                        height={80} // Set appropriate height for thumbnails
                                        className={`small-img ${mainImage === imgUrl ? 'active-thumbnail' : ''}`}
                                        alt={`${product.name} thumbnail ${index + 1}`}
                                        onClick={() => handleSmallImgClick(imgUrl)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="single-pro-details">
                    <h6>Home / {product.category || 'T-Shirt'}</h6>
                    <h4>{product.name}</h4>
                    <h2>₹{product.price}</h2>

                    {/* Size Selection */}
                    <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        disabled={!product.sizes || product.sizes.length === 0}
                    >
                        {(!selectedSize || !product.sizes || product.sizes.length === 0) && (
                            <option value="">Select Size</option>
                        )}
                        {product.sizes && product.sizes.map((sizeOption) => (
                            <option
                                key={sizeOption.size}
                                value={sizeOption.size}
                                disabled={sizeOption.stock === 0}
                            >
                                {sizeOption.size} {sizeOption.stock === 0 ? '(Out of Stock)' : `(${sizeOption.stock} in stock)`}
                            </option>
                        ))}
                    </select>

                    {/* Quantity Input */}
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="1"
                        max={currentSizeStock}
                        disabled={currentSizeStock === 0 || !selectedSize || quantity === 0}
                    />

                    {/* Add to Cart Button */}
                    <button
                        className="normal"
                        onClick={addToCart}
                        disabled={currentSizeStock === 0 || !selectedSize || quantity === 0 || quantity > currentSizeStock}
                    >
                        Add to Cart
                    </button>

                    {/* Product Description */}
                    <h4 style={{ paddingTop: "5px", fontSize: "25px", paddingBottom: "0px" }}>Product Details</h4>
                    <span>{product.description}</span>

                    {/* Share Button */}
                    <button className="share-btn" onClick={handleShareProduct} style={{
                        marginTop: '10px',
                        padding: '10px 15px',
                        backgroundColor: '#35396d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center',
                        transition: 'background-color 0.3s ease'
                    }}>
                        Share <FontAwesomeIcon icon={faShareAlt} />
                    </button>
                </div>
            </section>

            {/* --- More Colors Section --- */}
            <section>
                {sameCustomIdProducts.length > 1 && (
                    <div className="same-color" style={{ margin: '20px 0', borderTop: '1px solid #eee' }}>
                        <h4 style={{ marginBottom: '25px', textAlign: 'center', fontSize: '24px' }}>More Colors</h4>
                        <div className="color-group" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {sameCustomIdProducts.map(colorProduct => (
                                <div
                                    key={getProductId(colorProduct)}
                                    className={`color-option-thumbnail ${getProductId(colorProduct) === getProductId(product) ? 'active-color-current-product' : ''}`}
                                    onClick={() => handleColorThumbnailClick(colorProduct)}
                                    title={colorProduct.name}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        border: getProductId(colorProduct) === getProductId(product) ? '2px solid #F7B08C' : '1px solid #ccc',
                                        borderRadius: '5px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: getProductId(colorProduct) === getProductId(product) ? '0 0 5px rgba(247, 176, 140, 0.5)' : 'none',
                                        transition: 'all 0.2s ease-in-out',
                                        flexShrink: 0
                                    }}
                                >
                                    <Image
                                        src={colorProduct.images && colorProduct.images.length > 0 ? `/${colorProduct.images[0].url}` : '/products/f1.jpg'}
                                        alt={colorProduct.name}
                                        width={80}
                                        height={80}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* --- You Might Also Like Section --- */}
            {loadingAll && <div style={{ textAlign: 'center', padding: '20px' }}>Loading related products...</div>}
            {errorAll && <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error loading related products: {errorAll}</div>}

            {!loadingAll && !errorAll && productsToDisplay.length > 0 && (
                <section id="product1" className="section-p1">
                    <h2 style={{ marginBottom: '25px', textAlign: 'center', fontSize: '28px' }}>You Might Also Like</h2>
                    <div className="pro-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                        {productsToDisplay.map((p) => (
                            <div className="pro" key={getProductId(p)} onClick={() => handleColorThumbnailClick(p)} style={{
                                width: '23%',
                                minWidth: '250px',
                                padding: '10px 12px',
                                border: '1px solid #cce7d0',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                boxShadow: '20px 20px 30px rgba(0, 0, 0, 0.02)',
                                margin: '15px 0',
                                transition: '0.2s ease',
                                position: 'relative'
                            }}>
                                <Image
                                    src={p.images && p.images.length > 0 ? `/${p.images[0].url}` : '/products/f1.jpg'}
                                    alt={p.name}
                                    width={200}
                                    height={200}
                                    style={{ width: '100%', borderRadius: '20px', objectFit: 'cover' }}
                                />
                                <div className="des" style={{ textAlign: 'start', padding: '10px 0' }}>
                                    <span style={{ color: '#606063', fontSize: '12px' }}>{p.brand || 'ROCKSTAR'}</span>
                                    <h5 style={{ paddingTop: '7px', color: '#1a1a1a', fontSize: '14px' }}>{p.name}</h5>
                                    <div className="star" style={{ color: 'rgb(243, 181, 25)' }}>
                                        {Array.from({ length: p.ratings || 0 }, (_, i) => (
                                            <FontAwesomeIcon icon={faStar} key={i} />
                                        ))}
                                    </div>
                                    <h4 style={{ paddingTop: '7px', fontSize: '15px', fontWeight: '700', color: '#35396d' }}>₹{p.price}</h4>
                                </div>
                                {/* The cart icon on the product card */}
                                <a href="#" className="cart" style={{
                                    width: '40px',
                                    height: '40px',
                                    lineHeight: '40px',
                                    borderRadius: '50px',
                                    backgroundColor: '#e8f6ea',
                                    fontWeight: '500',
                                    color: '#35396d',
                                    position: 'absolute',
                                    bottom: '20px',
                                    right: '10px',
                                    textAlign: 'center',
                                    paddingLeft: '5px'
                                }}
                                // Consider adding an onClick handler to add to cart directly from here if desired
                                >
                                    <FontAwesomeIcon icon={faShoppingCart} />
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <ToastContainer />
        </div>
    );
}
