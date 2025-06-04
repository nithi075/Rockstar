<<<<<<< HEAD
// E:\Rockstar\rockstar-app-nextjs\src\app\product\[id]\page.jsx

// IMPORTANT: Add "use client" if you use client-side hooks like useState, useEffect, etc.
// If your component only fetches data and renders, you don't need it.
// For interactive parts like add to cart, you will likely need it.
"use client";

import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify'; // Adjust if you don't use it
import 'react-toastify/dist/ReactToastify.css'; // Adjust if you don't use it
import Image from 'next/image'; // For optimized images in Next.js
import { useParams } from 'next/navigation'; // To get the dynamic ID from URL

// --- Utility function (can be moved to a separate file like src/lib/utils.js) ---
const getProductId = (productData) => {
    if (!productData || !productData._id) return null;
    if (typeof productData._id === 'object' && productData._id.$oid) return productData._id.$oid;
    if (typeof productData._id === 'string') return productData._id;
    return null;

import { useState, useEffect } from 'react';

import { useParams, Link, useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faShoppingCart, faStar, faShareAlt } from '@fortawesome/free-solid-svg-icons';

import { toast } from 'react-toastify';



const getProductId = (productData) => {

    if (!productData || !productData._id) {

        return null;

    }

    // Handle MongoDB ObjectId structure if present

    if (typeof productData._id === 'object' && productData._id.$oid) {

        return productData._id.$oid;

    }

    if (typeof productData._id === 'string') {

        return productData._id;

    }

    return null;


};



// --- Your Backend API Base URL ---
const BACKEND_URL = 'https://backend-puaq.onrender.com'; // Use your actual backend URL
// --- End Backend API Base URL ---


// --- generateMetadata function (for SEO and Social Media Previews) ---
// NOTE: This runs on the server. Do NOT put "use client" in this file if you want this to run.
// If the entire file is "use client", you'll need to define metadata in layout.js or fetch client-side.
// For simplicity, we'll keep it in the same file assuming this is a Server Component or only the interactive parts are client.
// If this component becomes a full "use client" component, generateMetadata might need to be in a parent server component or layout.
// However, for the context of this example, we'll keep it here, as Next.js can optimize.

export async function generateMetadata({ params }) {
    const id = params.id; // Get the product ID from the URL

    let product = null;
    try {
        const response = await fetch(`<span class="math-inline">\{BACKEND\_URL\}/api/v1/products/</span>{id}`, { cache: 'no-store' }); // Ensure fresh data
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
    const defaultUrl = 'https://rockstar-fcga.onrender.com'; // Your actual deployed frontend URL

    // IMPORTANT: Replace 'https://rockstar-fcga.onrender.com' with your actual deployed frontend URL!
    const frontendBaseUrl = 'https://rockstar-fcga.onrender.com';

    const title = product ? `${product.name} - ROCKSTAR` : defaultTitle;
    const description = product ? product.description : defaultDescription;
    const imageUrl = product && product.images && product.images.length > 0
        ? `<span class="math-inline">\{frontendBaseUrl\}/</span>{product.images[0].url}` // Assuming images are in public folder
        : `<span class="math-inline">\{frontendBaseUrl\}</span>{defaultImageUrl}`;
    const canonicalUrl = `<span class="math-inline">\{frontendBaseUrl\}/product/</span>{id}`;

    return {
        title: title,
        description: description,
        // Favicon, etc.
        icons: {
            icon: '/favicon.ico', // Assuming you have a favicon in your public folder
        },
        // Open Graph (Facebook, LinkedIn, etc.)
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
        // Twitter Card
        twitter: {
            card: 'summary_large_image', // 'summary' for smaller image, 'summary_large_image' for larger
            site: '@rockstar_fashion', // Your Twitter handle (optional)
            creator: '@rockstar_fashion', // Your Twitter handle (optional)
            title: title,
            description: description,
            images: [imageUrl],
        },
        // Canonical URL (good for SEO, prevents duplicate content issues)
        alternates: {
            canonical: canonicalUrl,
        },
    };
}
// --- End generateMetadata ---


// --- Product Detail Page Component (Can be async if fetching data directly here) ---
export default function ProductDetailPage() {
    const { id } = useParams(); // Get the dynamic 'id' from the URL
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(''); // State for current main image
    const [smallImages, setSmallImages] = useState([]); // State for small product images

    // Function to handle adding product to cart (replace with your actual cart logic)
    const addToCart = () => {
        if (product) {
            // Implement your actual cart logic here
            toast.success(`${quantity} x ${product.name} added to cart!`);
            console.log(`Added ${quantity} of ${product.name} to cart.`);
        }
    };

    // Function to handle clicking on small images
    const handleSmallImgClick = (imagePath) => {
        setMainImage(imagePath);
    };

    // Use useEffect to fetch product data on the client side (if needed for interactive parts)
    // For SSR, the data can also be fetched directly in the component if it's a Server Component
    // or passed as props from a parent Server Component.
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`<span class="math-inline">\{BACKEND\_URL\}/api/v1/products/</span>{id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setProduct(data.product);
                    if (data.product.images && data.product.images.length > 0) {
                        setMainImage(`/${data.product.images[0].url}`); // Set initial main image
                        setSmallImages(data.product.images.map(img => `/${img.url}`)); // Set small images
                    } else {
                        setMainImage('/products/f1.jpg'); // Default image
                        setSmallImages(['/products/f1.jpg']);
                    }
                } else {
                    setError(data.message || 'Product not found');
                }
            } catch (err) {
                console.error("Error fetching product data:", err);
                setError('Failed to load product details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]); // Re-run effect if ID changes

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading product...</div>;
    }

    if (error || !product) {
        return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error || "Product not found."}</div>;
    }

    // --- Your Product Detail Page JSX (from your original ProductDetail.jsx) ---
    // Adapt your original ProductDetail.jsx's JSX structure here.
    // Replace <img src="..."> with <Image src="..." width={...} height={...} alt="..." />
    // Remember to provide width and height props for next/image.
    return (
        <div style={{ padding: '20px', display: 'flex', gap: '30px', maxWidth: '1200px', margin: 'auto' }}>
            {/* Main Product Image Section */}
            <div style={{ flex: 1 }}>
                {mainImage && (
                    <Image
                        src={mainImage}
                        alt={product.name}
                        width={500} // Adjust width as needed
                        height={500} // Adjust height as needed
                        style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '8px' }}
                        priority // Good for LCP on product pages
                    />
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {smallImages.map((imgUrl, index) => (
                        <Image
                            key={index}
                            src={imgUrl}
                            alt={`${product.name} small image ${index + 1}`}
                            width={80} // Adjust as needed
                            height={80} // Adjust as needed
                            onClick={() => handleSmallImgClick(imgUrl)}
                            style={{ border: mainImage === imgUrl ? '2px solid #35396d' : '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                        />
                    ))}
                </div>
            </div>

            {/* Product Details Section */}
            <div style={{ flex: 1, paddingLeft: '20px' }}>
                <h1>{product.name}</h1>
                <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#35396d' }}>₹{product.price}</p>
                <p style={{ lineHeight: '1.6' }}>{product.description}</p>

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        style={{ width: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                        onClick={addToCart}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#35396d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            fontWeight: 'bold',
                        }}
                    >
                        Add to Cart
                    </button>
                </div>
                {/* You can add more product details like category, brand, reviews, etc. */}
            </div>
            <ToastContainer />
        </div>
    );
}



export default function ProductDetail({ cart, setCart }) {

    const { id } = useParams();

    const navigate = useNavigate();



    const [qty, setQty] = useState(1);

    const [product, setProduct] = useState(null);

    const [allProducts, setAllProducts] = useState([]);

    const [mainImg, setMainImg] = useState('');

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [loadingAll, setLoadingAll] = useState(true);

    const [errorAll, setErrorAll] = useState(null);

    const [selectedSize, setSelectedSize] = useState('');

    const [currentSizeStock, setCurrentSizeStock] = useState(0);



    const [sameCustomIdProducts, setSameCustomIdProducts] = useState([]);



    function addToCart() {

        if (!product) {

            console.warn("addToCart: No product data to add to cart. Product is null.");

            toast.error("Product data not loaded. Please try again.");

            return;

        }

        if (qty < 1) {

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



        if (qty > selectedSizeObject.stock) {

            toast.warn(`Cannot add ${qty} of size ${selectedSize}. Only ${selectedSizeObject.stock} available.`);

            setQty(selectedSizeObject.stock);

            return;

        }



        const currentProductId = getProductId(product);

        if (!currentProductId) {

            console.error("addToCart: Could not determine valid product ID for current product:", product);

            toast.error("Could not add to cart due to product ID error.");

            return;

        }



        setCart((prevCart) => {

            const existingItem = prevCart.find(item => {

                const itemProductId = getProductId(item.product);

                return itemProductId === currentProductId && item.size === selectedSize;

            });



            if (existingItem) {

                if (existingItem.qty + qty > selectedSizeObject.stock) {

                    toast.warn(`Adding ${qty} more would exceed stock for size ${selectedSize}. You already have ${existingItem.qty} in cart. Max available: ${selectedSizeObject.stock}`);

                    return prevCart;

                }

                const updatedCart = prevCart.map(item =>

                    (getProductId(item.product) === currentProductId && item.size === selectedSize)

                        ? { ...item, qty: item.qty + qty }

                        : item

                );

                toast.success(`Updated quantity for ${product.name} (Size: ${selectedSize}) in cart!`);

                return updatedCart;

            } else {

                const newCart = [...prevCart, { product, qty, size: selectedSize }];

                toast.success(`${product.name} (Size: ${selectedSize}, Qty: ${qty}) added to cart!`);

                return newCart;

            }

        });

    }



    useEffect(() => {

        const fetchProductDetails = async (productId) => {

            console.log(`ProductDetail: Fetching product details for ID: ${productId}`);

            setLoading(true);

            setError(null);

            try {

                const response = await fetch(`https://backend-puaq.onrender.com/api/v1/product/${productId}`);

                if (!response.ok) {

                    throw new Error(`HTTP error! status: ${response.status}`);

                }

                const data = await response.json();

                if (data.success && data.product) {

                    setProduct(data.product);

                    setMainImg(data.product.images && data.product.images.length > 0 ? `/${data.product.images[0].url}` : '/products/f1.jpg');

                    console.log("ProductDetail: Successfully fetched product:", data.product);



                    if (data.product.sizes && data.product.sizes.length > 0) {

                        const firstAvailableSize = data.product.sizes.find(s => s.stock > 0);

                        if (firstAvailableSize) {

                            setSelectedSize(firstAvailableSize.size);

                            setCurrentSizeStock(firstAvailableSize.stock);

                            console.log(`ProductDetail: Initial selected size: ${firstAvailableSize.size}, stock: ${firstAvailableSize.stock}`);

                        } else {

                            setSelectedSize('');

                            setCurrentSizeStock(0);

                            console.log("ProductDetail: All sizes are out of stock for this product.");

                        }

                    } else {

                        setSelectedSize('');

                        setCurrentSizeStock(0);

                        console.log("ProductDetail: No size information for this product.");

                    }

                    setQty(1);

                } else {

                    setError('Product not found');

                    setProduct(null);

                    setSelectedSize('');

                    setCurrentSizeStock(0);

                    console.error("ProductDetail: Product not found:", data.message);

                }

            } catch (err) {

                setError('Failed to fetch product details');

                console.error('ProductDetail: Error fetching product details:', err);

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

    }, [id]);



    useEffect(() => {

        if (product && selectedSize) {

            const sizeObj = product.sizes.find(s => s.size === selectedSize);

            const newStock = sizeObj ? sizeObj.stock : 0;

            setCurrentSizeStock(newStock);

            console.log(`ProductDetail: Selected size changed to ${selectedSize}, updated stock to ${newStock}`);



            setQty(prevQty => {

                if (newStock === 0) return 0;

                if (prevQty === 0) return 1;

                return Math.min(prevQty, newStock);

            });

        } else {

            setCurrentSizeStock(0);

            setQty(0);

        }

    }, [selectedSize, product]);



    useEffect(() => {

        const fetchAllProducts = async () => {

            console.log("ProductDetail: Fetching all products for 'You might also like' and 'More Colors'.");

            setLoadingAll(true);

            setErrorAll(null);

            try {

                const response = await fetch('https://backend-puaq.onrender.com/api/v1/products');

                if (!response.ok) {

                    throw new Error(`HTTP error! status: ${response.status}`);

                }

                const data = await response.json();

                if (data.success && data.products) {

                    setAllProducts(data.products);

                    console.log("ProductDetail: Successfully fetched all products.");

                }

            } catch (err) {

                setErrorAll('Failed to load all products');

                console.error('ProductDetail: Error fetching all products:', err);

            } finally {

                setLoadingAll(false);

            }

        };



        fetchAllProducts();

    }, []);



    const getBaseCustomId = (customId) => {

        if (!customId) return null;

        const match = customId.match(/^(.*?)([_.-]?\d+)$/);

        return match ? match[1] : customId;

    };



    useEffect(() => {

        if (product && allProducts.length > 0) {

            const currentBaseCustomId = getBaseCustomId(product.customId);



            if (currentBaseCustomId) {

                const productsWithSameBaseCustomId = allProducts.filter(p =>

                    p.customId && getBaseCustomId(p.customId) === currentBaseCustomId

                );

                productsWithSameBaseCustomId.sort((a, b) => a.name.localeCompare(b.name));

                setSameCustomIdProducts(productsWithSameBaseCustomId);

                console.log("ProductDetail: Found products with same base customId (including current):", productsWithSameBaseCustomId);

            } else {

                setSameCustomIdProducts([]);

                console.log("ProductDetail: Current product has no base customId for 'More Colors'.");

            }

        } else {

            setSameCustomIdProducts([]);

        }

    }, [product, allProducts]);



    const handleSmallImgClick = (newSrc) => {

        setMainImg(newSrc);

    };



    const handleColorThumbnailClick = (clickedProduct) => {

        const clickedProductId = getProductId(clickedProduct);

        const currentProductId = getProductId(product);



        if (clickedProductId === currentProductId) {

            console.log("ProductDetail: Clicked on the current product's color option. No navigation needed.");

            return;

        }



        navigate(`/product/${clickedProductId}`);

        window.scrollTo({ top: 0, behavior: 'smooth' });

    };



    const handleShareProduct = async () => {

        if (!product || !id) {

            toast.error("Product information not available to share.");

            return;

        }



           // You need to replace 'https://your-frontend-domain.onrender.com'

        // with the actual URL of your deployed frontend application.

        const frontendBaseUrl = 'https://rockstar-fcga.onrender.com'; // <--- **IMPORTANT: Replace with your actual frontend URL**

        const productShareUrl = `${frontendBaseUrl}/product/${id}`;

        // --- CHANGE ENDS HERE ---



        try {

            if (navigator.share) {

                await navigator.share({

                    title: product.name,

                    text: `Check out this amazing product: ${product.name} - ${product.description}`, // Added description for better share text

                    url: productShareUrl,

                });

                toast.success("Product shared successfully!");

            } else if (navigator.clipboard) {

                await navigator.clipboard.writeText(productShareUrl);

                toast.success("Product link copied to clipboard!");

            } else {

                // Fallback for browsers that don't support navigator.share or navigator.clipboard

                // Uses a prompt to let the user manually copy the link.

                // Make sure to show the actual URL in the prompt.

                prompt("Copy this link to share:", productShareUrl);

            }

        } catch (error) {

            console.error("Error sharing product:", error);

            // Check for user aborting share (e.g., clicking 'Cancel')

            if (error.name !== 'AbortError') {

                toast.error("Failed to share product.");

            } else {

                // User cancelled the share operation, no need for an error toast.

                console.log("Product sharing aborted by user.");

            }

        }

    };



    if (loading) {

        return <div>Loading product details...</div>;

    }

    if (error) {

        return <div>Error: {error}</div>;

    }

    if (!product) {

        return <div>Product not found.</div>;

    }



    const currentProductBaseIdForRelated = getBaseCustomId(product.customId);

    let productsToDisplay = [];



    // Set the desired count for "You might also like"

    const desiredCount = 8;



    // Filter out the current product and any product that shares its baseCustomId

    const unrelatedProducts = allProducts.filter(p => {

        const pId = getProductId(p);

        const currentId = getProductId(product);

        const pBaseCustomId = getBaseCustomId(p.customId);



        // Exclude the current product itself

        // Exclude any product that shares the same base custom ID as the current product

        return pId !== currentId && pBaseCustomId !== currentProductBaseIdForRelated;

    });



    // Randomly select products from the filtered list to fill the desired count

    // Shuffle the unrelatedProducts array and take the first `desiredCount` elements

    const randomFill = [...unrelatedProducts].sort(() => 0.5 - Math.random()).slice(0, desiredCount);

    productsToDisplay = randomFill;





    // Although productsToDisplay is already sliced to desiredCount,

    // this line ensures it strictly adheres to the desiredCount just in case.

    const finalProductsToDisplay = productsToDisplay.slice(0, desiredCount);



    return (

        <div className="product-detail-page">

            <section className="pro-detail" id="section-p1">

                <div className="single-pro-image">

                    <div className="image-wrapper">

                        <img src={mainImg} alt={product.name} id="MainImg"

                        width="100%" />

                    </div>

                    {product.images && product.images.length > 1 && (

                        <div className="small-img-group">

                            {product.images.map((image, index) => (

                                <div className="small-img-col" key={index}>

                                    <img

                                        src={`/${image.url}`}

                                        width="100%"

                                        className={`small-img ${mainImg === `/${image.url}` ? 'active-thumbnail' : ''}`}

                                        alt={`${product.name} thumbnail ${index + 1}`}

                                        onClick={() => handleSmallImgClick(`/${image.url}`)}

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

                    <input

                        type="number"

                        value={qty}

                        onChange={(e) => setQty(Number(e.target.value))}

                        min="1"

                        max={currentSizeStock}

                        disabled={currentSizeStock === 0 || !selectedSize || qty === 0}

                    />

                    <button className="normal" onClick={addToCart}

                        disabled={currentSizeStock === 0 || !selectedSize || qty === 0 || qty > currentSizeStock}>

                        Add to Cart

                    </button>



                    <h4 style={{paddingTop:"5px" ,fontSize:"25px",paddingBottom:"0px"}}>Product Details</h4>

                    <span>{product.description}</span>

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

                                    <img

                                        src={colorProduct.images && colorProduct.images.length > 0 ? `/${colorProduct.images[0].url}` : '/products/f1.jpg'}

                                        alt={colorProduct.name}

                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}

                                    />

                                </div>

                            ))}

                        </div>

                    </div>

                )}



            </section>



            {loadingAll && <div>Loading related products...</div>}

            {errorAll && <div>Error loading related products: {errorAll}</div>}



            {!loadingAll && !errorAll && finalProductsToDisplay.length > 0 && (

                <section className="feature" id="section-p1" style={{paddingTop:"5px"}}>

                    <h2 style={{paddingBottom:"0", lineHeight:"0px" ,fontSize:"25px"}}>You might also like</h2>



                    <div className="pro-container" style={{paddingTop:"5px"}}>

                        {finalProductsToDisplay.map(relatedProduct => (

                            <Link to={`/product/${getProductId(relatedProduct)}`} key={getProductId(relatedProduct)} className="pro-link-wrapper">

                                <div className="pro">

                                    <div className="image-wrapper">

                                        <img src={relatedProduct.images && relatedProduct.images.length > 0 ? `/${relatedProduct.images[0].url}` : 'img/products/f1.jpg'} alt={relatedProduct.name} />

                                    </div>

                                    <div className="des">

                                        {relatedProduct.brand && <span>{relatedProduct.brand}</span>}

                                        <h5 style={{paddingTop:"5px"}}>{relatedProduct.name}</h5>



                                        <h4>₹{(parseFloat(relatedProduct.price) || 0).toFixed(2)}</h4>

                                    </div>

                                </div>

                            </Link>

                        ))}

                    </div>

                </section>

            )}

        </div>

    );

}

