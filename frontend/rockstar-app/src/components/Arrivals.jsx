import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';

config.autoAddCss = false;

export default function Arrivals() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch products. The backend will now sort them by importDate by default.
        // You can optionally add `&limit=X` if you want to explicitly request
        // a certain number of the latest products from the backend,
        // e.g., `?limit=12` if you want to ensure enough for 8 unique.
        const response = await fetch(`https://backend-puaq.onrender.com/api/v1/products?limit=12&timestamp=${new Date().getTime()}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.products) {
          // No need for a random importDate fallback here.
          // The backend should be providing the correct importDate.
          setProducts(data.products);
        } else {
          setError('Failed to load products: API response format invalid.');
          console.error('API response:', data);
        }
      } catch (err) {
        setError(`Failed to fetch products: ${err.message}`);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  // Deduplicate products based on customId prefix
  const deduplicatedProducts = [];
  const seenCustomIds = new Set();

  for (const product of products) {
    const customIdPrefix = product.customId ? product.customId.substring(0, 19) : null;
    if (customIdPrefix && !seenCustomIds.has(customIdPrefix)) {
      deduplicatedProducts.push(product);
      seenCustomIds.add(customIdPrefix);
    } else if (!customIdPrefix) {
      // If a product doesn't have a customId, include it without deduplication
      deduplicatedProducts.push(product);
    }
  }

  // Slice to get the top 8 (or fewer if not enough) after deduplication.
  // The backend already sorted by importDate, so these will be the latest.
  const newArrivals = deduplicatedProducts.slice(0, 8);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <div className="text-center p-4 text-lg">Loading new arrivals...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600 text-lg">Error loading new arrivals: {error}</div>;
  }

  // Display a message if no products are found at all
  if (newArrivals.length === 0) {
    return <div className="text-center p-4 text-lg">No new arrivals to display.</div>;
  }

  return (
    <section className="feature" id="section-p1">
      <h2 className="text-4xl font-bold mb-2">New Arrivals</h2>
      <p className="text-lg text-gray-700 mb-8"> Collections with New Modern Design</p>
      <div className="pro-container flex flex-wrap justify-center gap-6 px-4">
        {newArrivals.map((product) => (
          <div
            className="pro w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-4 border border-gray-300 rounded-lg shadow-md bg-white cursor-pointer transition-transform duration-200 hover:scale-105 flex flex-col"
            key={product._id}
            onClick={() => handleProductClick(product._id)}
          >
            {/* Image directly inside, letting it dictate height */}
            <div className="relative mb-2 w-full">
              <img
                src={product.images && product.images[0] && product.images[0].url ? product.images[0].url : '/products/placeholder.jpg'}
                alt={product.name}
                className="w-full h-auto object-contain mx-auto"
              />
            </div>
            <div className="des text-left flex-grow">
              <h5 className="text-xl font-semibold mt-1 mb-2 truncate">{product.name}</h5>
              <h4 className="text-2xl font-bold text-blue-700">₹{product.price}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
