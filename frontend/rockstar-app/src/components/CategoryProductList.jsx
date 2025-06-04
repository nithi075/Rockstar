// CategoryProductList.jsx (Example structure)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// Import your product display component if you have one (e.g., ProductCard)

export default function CategoryProductList() {
    const { categoryName } = useParams(); // Get the category from the URL
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductsByCategory = async () => {
            setLoading(true);
            setError(null);
            try {
                // Adjust this API endpoint to match your backend's filtering capability
                // It's crucial your backend supports filtering by category name
                const response = await fetch(`https://backend-puaq.onrender.com/api/v1/products?category=${categoryName}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success && data.products) {
                    setCategoryProducts(data.products);
                } else {
                    setError('No products found for this category or API response invalid.');
                }
            } catch (err) {
                setError(`Failed to fetch products: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (categoryName) {
            fetchProductsByCategory();
        }
    }, [categoryName]); // Re-fetch when categoryName changes

    if (loading) return <div>Loading {categoryName} products...</div>;
    if (error) return <div>Error: {error}</div>;
    if (categoryProducts.length === 0) return <div>No products found for "{categoryName}".</div>;

    return (
        <section className="category-page-products py-8">
            <h2 className="text-4xl font-bold text-center mb-8">{categoryName.replace(/-/g, ' ').toUpperCase()}</h2>
            <div className="pro-container flex flex-wrap justify-center gap-6 px-4">
                {categoryProducts.map(product => (
                    // Render your product card here
                    // Make sure your ProductCard component can receive product data
                    <div key={product._id} className="pro">
                        <img src={`/${product.images?.[0]?.url || 'products/placeholder.jpg'}`} alt={product.name} />
                        <div className="des text-left">
                            <h5>{product.name}</h5>
                            <h4>₹{product.price}</h4>
                        </div>
                        {/* Add cart icon or link to product detail if desired */}
                    </div>
                ))}
            </div>
        </section>
    );
}
