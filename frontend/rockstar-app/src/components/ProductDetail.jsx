// src/app/product/[id]/page.jsx
// Mark this file as a Client Component because it uses useState, useEffect, and browser APIs like navigator.share.
// Data fetching for metadata and initial props still happens on the server before this component renders.
"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Image from 'next/image'; // Next.js optimized Image component
import Link from 'next/link';   // Next.js Link for client-side navigation
import { useParams, useRouter } from 'next/navigation'; // Next.js specific hooks

// --- Utility Functions (can be moved to a separate file like src/lib/utils.js) ---
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

const getBaseCustomId = (customId) => {
    if (!customId) return null;
    const match = customId.match(/^(.*?)([_.-]?\d+)$/);
    return match ? match[1] : customId;
};
// --- End Utility Functions ---

// Your backend base URL
const BACKEND_URL = 'https://backend-puaq.onrender.com';
// IMPORTANT: Replace with your actual deployed Next.js frontend URL
const FRONTEND_URL = 'https://rockstar-fcga.onrender.com';

// --- METADATA GENERATION (Runs on the server for SEO and Social Previews) ---
// This function will be called by Next.js on the server to generate <head> tags
// for this specific product page.
export async function generateMetadata({ params }) {
    const { id } = params; // Get product ID from the URL

    let productData = null;
    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/product/${id}`, { cache: 'no-store' }); // Ensure fresh data
        if (!response.ok) {
            console.error(`Failed to fetch product for metadata for ID: ${id}. Status: ${response.status}`);
            return {
                title: 'Product Not Found - ROCKSTAR',
                description: 'The product you are looking for could not be found.',
                openGraph: {
                    title: 'Product Not Found - ROCKSTAR',
                    description: 'The product you are looking for could not be found.',
                    url: `${FRONTEND_URL}/product/${id}`,
                    images: [`${FRONTEND_URL}/default-share-image.jpg`], // Fallback image
                    type: 'website',
                },
                twitter: {
                    card: 'summary_large_image',
                    title: 'Product Not Found - ROCKSTAR',
                    description: 'The product you are looking for could not be found.',
                    images: [`${FRONTEND_URL}/default-share-image.jpg`],
                },
            };
        }
        const data = await response.json();
        if (data.success && data.product) {
            productData = data.product;
        } else {
            console.warn(`Product ${id} found but data.success is false or product is null.`);
        }
    } catch (error) {
        console.error("Error fetching product for metadata:", error);
        return {
            title: 'Error Loading Product - ROCKSTAR',
            description: 'An error occurred while trying to load the product details.',
        };
    }

    if (!productData) {
        return {
            title: 'Product Not Found - ROCKSTAR',
            description: 'The product you are looking for could not be found.',
            openGraph: {
                title: 'Product Not Found - ROCKSTAR',
                description: 'The product you are looking for could not be found.',
                url: `${FRONTEND_URL}/product/${id}`,
                images: [`${FRONTEND_URL}/default-share-image.jpg`],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: 'Product Not Found - ROCKSTAR',
                description: 'The product you are looking for could not be found.',
                images: [`${FRONTEND_URL}/default-share-image.jpg`],
            },
        };
    }

    const mainImageUrl = productData.images && productData.images.length > 0
        ? `${FRONTEND_URL}/${productData.images[0].url}` // Absolute URL for sharing
        : `${FRONTEND_URL}/default-share-image.jpg`; // Fallback image for product

    return {
        title: `${productData.name} - ROCKSTAR`,
        description: productData.description.substring(0, 160) + (productData.description.length > 160 ? '...' : ''),
        openGraph: {
            title: `${productData.name} - ROCKSTAR`,
            description: productData.description.substring(0, 200) + (productData.description.length > 200 ? '...' : ''),
            url: `${FRONTEND_URL}/product/${getProductId(productData)}`,
            images: [
                {
                    url: mainImageUrl,
                    width: 1200,
                    height: 630,
                    alt: productData.name,
                },
            ],
            type: 'product',
            siteName: 'ROCKSTAR',
            ...(productData.price && {
                // @ts-ignore
                'og:price:amount': productData.price.toString(),
                // @ts-ignore
                'og:price:currency': 'INR',
            }),
        },
        twitter: {
            card: 'summary_large_image',
            title: `${productData.name} - ROCKSTAR`,
            description: productData.description.substring(0, 200) + (productData.description.length > 200 ? '...' : ''),
            images: [mainImageUrl],
            creator: '@YourTwitterHandle', // Optional
        },
    };
}


// --- MAIN PAGE COMPONENT (Client Component with Server-fetched initial data) ---
export default function ProductDetailPage() {
    const params = useParams(); // Get URL parameters (e.g., { id: 'some-id' })
    const router = useRouter(); // Next.js router for programmatic navigation
    const { id } = params;

    // --- State Management ---
    // All these states are client-side as this is a "use client" component.
    const [product, setProduct] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [mainImg, setMainImg] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [currentSizeStock, setCurrentSizeStock] = useState(0);
    const [qty, setQty] = useState(1);
    const [sameCustomIdProducts, setSameCustomIdProducts] = useState([]);


    // --- Data Fetching (runs on client after initial server render) ---
    // This useEffect will run on the client-side when the component mounts or `id` changes.
    // In a real Next.js app, you'd typically fetch the initial product data
    // on the server *before* this component renders, and pass it as a prop.
    // However, since this component is marked "use client" and heavily relies on
    // useEffect/useState for dynamic behavior, fetching here keeps your logic together.
    // For optimal SSR, you'd fetch in `generateMetadata` (as above) AND
    // directly in the component's `async` function if it were a Server Component,
    // then pass initial data to this Client Component as props.
    // For simplicity, here we're fetching both in client-side useEffect,
    // which is less ideal for initial load but still works.
    useEffect(() => {
        const fetchProductAndAllProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch specific product
                const productResponse = await fetch(`${BACKEND_URL}/api/v1/product/${id}`);
                if (!productResponse.ok) {
                    throw new Error(`Failed to fetch product ${id}: ${productResponse.status}`);
                }
                const productData = await productResponse.json();
                if (productData.success && productData.product) {
                    setProduct(productData.product);
                    setMainImg(productData.product.images && productData.product.images.length > 0 ? `/${productData.product.images[0].url}` : '/products/f1.jpg');

                    // Initialize size and stock
                    if (productData.product.sizes && productData.product.sizes.length > 0) {
                        const firstAvailableSize = productData.product.sizes.find(s => s.stock > 0);
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
                    setQty(1); // Reset quantity on product change
                } else {
                    setError('Product not found or invalid data.');
                    setProduct(null);
                }

                // Fetch all products (for related items)
                const allProductsResponse = await fetch(`${BACKEND_URL}/api/v1/products`);
                if (!allProductsResponse.ok) {
                    throw new Error(`Failed to fetch all products: ${allProductsResponse.status}`);
                }
                const allProductsData = await allProductsResponse.json();
                if (allProductsData.success && allProductsData.products) {
                    setAllProducts(allProductsData.products);
                }

            } catch (err) {
                console.error("Error in ProductDetail:", err);
                setError(err.message);
                setProduct(null);
                setAllProducts([]);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductAndAllProducts();
        }
    }, [id]); // Re-fetch when product ID changes

    // Effect to update currentSizeStock and qty when selectedSize or product changes
    useEffect(() => {
        if (product && selectedSize) {
            const sizeObj = product.sizes.find(s => s.size === selectedSize);
            const newStock = sizeObj ? sizeObj.stock : 0;
            setCurrentSizeStock(newStock);

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

    // Effect to calculate sameCustomIdProducts
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


    // --- Event Handlers ---
    function addToCart() {
        // This logic is mostly client-side and would need to interact with a global cart state (Context API, Redux, Zustand)
        // For this example, I'm just showing the toast, as `cart` and `setCart` are props from a parent component.
        // In Next.js, this `cart` would likely be a state managed in a client-side context provider.
        if (!product) {
            toast.error("Product data not loaded. Please try again.");
            return;
        }
        if (qty < 1) {
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

        // Example of how you would interact with a global cart context:
        // const { addItemToCart } = useCart(); // Assuming you have a useCart hook from your context
        // addItemToCart({ product, qty, size: selectedSize });
        toast.success(`${product.name} (Size: ${selectedSize}, Qty: ${qty}) added to cart!`);
    }

    const handleSmallImgClick = (newSrc) => {
        setMainImg(newSrc);
    };

    const handleColorThumbnailClick = (clickedProduct) => {
        const clickedProductId = getProductId(clickedProduct);
        const currentProductId = getProductId(product);

        if (clickedProductId === currentProductId) {
            return; // No navigation needed if clicking current product
        }
        // Use Next.js router for programmatic navigation
        router.push(`/product/${clickedProductId}`);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top after navigation
    };

    const handleShareProduct = async () => {
        if (!product || !id) {
            toast.error("Product information not available to share.");
            return;
        }

        const productShareUrl = `${FRONTEND_URL}/product/${id}`;

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
            if (error.name !== 'AbortError') {
                toast.error("Failed to share product.");
            } else {
                console.log("Product sharing aborted by user.");
            }
        }
    };


    // --- Loading, Error, Not Found States ---
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading product details...</div>;
    }
    if (error) {
        return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}. Please try again later.</div>;
    }
    if (!product) {
        // This means product was null after loading, suggesting not found or API issue
        // Next.js `notFound()` is better for true 404s in Server Components
        return <div style={{ textAlign: 'center', padding: '50px' }}>Product not found.</div>;
    }

    // --- Related Products Logic ---
    const currentProductBaseIdForRelated = getBaseCustomId(product.customId);
    const desiredCount = 8;
    const unrelatedProducts = allProducts.filter(p => {
        const pId = getProductId(p);
        const currentId = getProductId(product);
        const pBaseCustomId = getBaseCustomId(p.customId);
        return pId !== currentId && pBaseCustomId !== currentProductBaseIdForRelated;
    });
    const finalProductsToDisplay = [...unrelatedProducts].sort(() => 0.5 - Math.random()).slice(0, desiredCount);


    // --- Component JSX (Rendering) ---
    return (
        <div className="product-detail-page">
            <section className="pro-detail" id="section-p1">
                <div className="single-pro-image">
                    <div className="image-wrapper">
                        {/* Use Next.js Image component */}
                        <Image
                            src={mainImg} // `mainImg` is client-side state
                            alt={product.name}
                            width={500} // Set appropriate width for your layout
                            height={500} // Set appropriate height
                            style={{ width: '100%', height: 'auto' }} // Ensure responsiveness
                            priority // Optimize for Largest Contentful Paint
                        />
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="small-img-group">
                            {product.images.map((image, index) => (
                                <div className="small-img-col" key={index}>
                                    <Image
                                        src={`/${image.url}`} // Image source
                                        width={100} // Smaller size for thumbnails
                                        height={100}
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

                    <h4 style={{ paddingTop: "5px", fontSize: "25px", paddingBottom: "0px" }}>Product Details</h4>
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
                                        width: '80px', height: '80px', border: getProductId(colorProduct) === getProductId(product) ? '2px solid #F7B08C' : '1px solid #ccc',
                                        borderRadius: '5px', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', boxShadow: getProductId(colorProduct) === getProductId(product) ? '0 0 5px rgba(247, 176, 140, 0.5)' : 'none',
                                        transition: 'all 0.2s ease-in-out', flexShrink: 0
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

            {finalProductsToDisplay.length > 0 && (
                <section className="feature" id="section-p1" style={{ paddingTop: "5px" }}>
                    <h2 style={{ paddingBottom: "0", lineHeight: "0px", fontSize: "25px" }}>You might also like</h2>

                    <div className="pro-container" style={{ paddingTop: "5px" }}>
                        {finalProductsToDisplay.map(relatedProduct => (
                            <Link href={`/product/${getProductId(relatedProduct)}`} key={getProductId(relatedProduct)} className="pro-link-wrapper">
                                <div className="pro">
                                    <div className="image-wrapper">
                                        <Image
                                            src={relatedProduct.images && relatedProduct.images.length > 0 ? `/${relatedProduct.images[0].url}` : 'img/products/f1.jpg'}
                                            alt={relatedProduct.name}
                                            width={250} // Adjust size for related product thumbnails
                                            height={250}
                                            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="des">
                                        {relatedProduct.brand && <span>{relatedProduct.brand}</span>}
                                        <h5 style={{ paddingTop: "5px" }}>{relatedProduct.name}</h5>
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
