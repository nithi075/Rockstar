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
};
// --- End Utility function ---

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