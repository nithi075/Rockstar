import { useEffect, useState, useRef } from "react";
import ProductCard from "../components/ProductList"; // Assuming ProductList.jsx exports a component named ProductCard as default
import { useSearchParams, Link, useLocation } from "react-router-dom"; // Removed useParams as we use searchParams
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltRight, faLongArrowAltLeft } from '@fortawesome/free-solid-svg-icons';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // Get current category and keyword from URL search parameters
    const currentCategory = searchParams.get('category');
    const currentKeyword = searchParams.get('keyword');

    // Use refs to keep track of previous category and keyword for page reset logic
    const prevCategoryRef = useRef(currentCategory);
    const prevKeywordRef = useRef(currentKeyword);

    // Initialize currentPage from URL search param, or default to 1
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

    const [totalPages, setTotalPages] = useState(1);
    const productsPerPage = 12;

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

    // Effect to manage currentPage state based on URL changes
    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('page')) || 1;

        // Check if category or keyword has changed (navigating to a new filter)
        const isNewCategory = currentCategory !== prevCategoryRef.current;
        const isNewKeyword = currentKeyword !== prevKeywordRef.current;

        if (isNewCategory || isNewKeyword) {
            // If a new category or keyword is applied, always reset to page 1
            console.log("Shop.jsx: New category or keyword detected. Resetting to page 1.");
            setCurrentPage(1);
            // Also ensure the URL reflects page 1 if it's not already there
            const newSearchParams = new URLSearchParams(searchParams);
            if (newSearchParams.get('page') !== '1') {
                newSearchParams.set('page', '1');
                setSearchParams(newSearchParams); // Update URL to page=1
            }
        } else if (currentPage !== pageFromUrl) {
            // Otherwise, update page state if URL page param has changed (e.g., from direct URL entry or back/forward)
            setCurrentPage(pageFromUrl);
        }

        // Update refs for the next render
        prevCategoryRef.current = currentCategory;
        prevKeywordRef.current = currentKeyword;

    }, [location.search, searchParams, currentCategory, currentKeyword]); // Depend on relevant search params

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                // Build the base URL with pagination
                let url = `https://backend-puaq.onrender.com/api/v1/products?page=${currentPage}&limit=${productsPerPage}`;

                // Add category filter if present
                if (currentCategory) {
                    url += `&category=${currentCategory}`;
                    console.log(`Shop.jsx: Fetching by category: "${currentCategory}", Page: ${currentPage}`);
                }
                // Add keyword filter if present (and no category filter, or if you want both)
                // Assuming keyword takes precedence if both are present from a search bar,
                // or if you want to allow searching within a category.
                // For simplicity, let's prioritize category if it exists.
                else if (currentKeyword) { // Only apply keyword if no category is present
                    url += `&keyword=${currentKeyword}`;
                    console.log(`Shop.jsx: Fetching by search keyword: "${currentKeyword}", Page: ${currentPage}`);
                } else {
                    console.log(`Shop.jsx: Fetching all products, Page: ${currentPage}`);
                }

                console.log("Shop.jsx: Final API URL:", url); // Crucial log

                const response = await fetch(url);
                const data = await response.json();

                if (response.ok && data.success) {
                    setProducts(data.products);
                    setTotalPages(Math.ceil(data.totalProducts / productsPerPage));
                } else {
                    setError(data.message || 'Failed to fetch products.');
                    setProducts([]);
                    setTotalPages(1);
                }
            } catch (err) {
                console.error("Shop.jsx: Error fetching products:", err);
                setError('Network error: Could not connect to the server. Please check your internet connection or try again later.');
                setProducts([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        // Depend on currentPage, currentCategory, and currentKeyword
        // These are the actual values used to build the fetch URL.
    }, [currentPage, currentCategory, currentKeyword]);

    // Helper to generate correct pagination links based on current filter state
    const getPaginationLink = (page) => {
        const params = new URLSearchParams();
        if (currentCategory) {
            params.append('category', currentCategory);
        } else if (currentKeyword) {
            params.append('keyword', currentKeyword);
        }
        params.append('page', page.toString());
        return `/shop?${params.toString()}`;
    };

    // Handle next page click
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const nextPage = currentPage + 1;
            // No need to setCurrentPage here, as the Link component or setSearchParams will update the URL
            // and the useEffect will react to it.
            // For programmatic navigation, you'd do:
            // const params = new URLSearchParams(searchParams);
            // params.set('page', nextPage.toString());
            // setSearchParams(params);
            window.scrollTo(0, 0); // Scroll to top on page change for better UX
        }
    };

    // Handle previous page click
    const handlePrevPage = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            // Similar to next page, rely on Link or setSearchParams
            // const params = new URLSearchParams(searchParams);
            // params.set('page', prevPage.toString());
            // setSearchParams(params);
            window.scrollTo(0, 0); // Scroll to top on page change for better UX
        }
    };

    // --- Conditional Rendering Logic ---
    if (loading) {
        return (
            <section id="shop-products" className="section-p1">
                <div style={{ textAlign: 'center', padding: '50px 0', backgroundColor: "#F7B08C" }}>
                    <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#333' }}>Loading products...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="shop-products" className="section-p1">
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'red' }}>Error: {error}</p>
                    <p style={{ fontSize: '1em', color: '#666', marginTop: '10px' }}>
                        Please ensure your backend server is running and accessible at <code>http://localhost:8000</code>.
                    </p>
                </div>
            </section>
        );
    }

    // Determine the current filter term for display in "no products found" message
    const currentFilterTerm = currentCategory || currentKeyword; // Prioritize category for display

    if (products.length === 0) {
        return (
            <>
                <section id="page-header" className="page-header-shop">
                    <h2>#Explore</h2>
                    <p>Discover amazing styles!</p>
                </section>
                <section className="products" id="section-p1">
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#333' }}>
                            No products found
                            {currentFilterTerm && (
                                <> for "<span style={{ color: '#088178' }}>{currentFilterTerm}</span>"</>
                            )}
                            .
                        </p>
                        <p style={{ fontSize: '1em', color: '#666', marginTop: '10px' }}>
                            Please try a different {currentFilterTerm ? 'filter' : 'search term'} or browse our <Link to="/shop" style={{ color: '#088178', textDecoration: 'underline' }}>entire collection</Link>.
                        </p>
                    </div>
                </section>
            </>
        );
    }

    // Determine the header title based on the active filter
    const headerTitle = currentCategory
        ? currentCategory.toUpperCase()
        : (currentKeyword ? `SEARCH RESULTS FOR "${currentKeyword.toUpperCase()}"` : 'EXPLORE OUR COLLECTION');


    return (
        <>
            <section id="page-header" className="page-header-shop">
                <h2>{headerTitle}</h2>
                <span>{currentCategory ? 'Discover our curated selection of ' + currentCategory + '.' : 'Invest in your wardrobe, invest in yourself.'}</span>
            </section>

            <section className="products" id="section-p1">
                <div className="pro-container">
                    {products.map(product => (
                        <ProductCard key={getProductId(product)} product={product} />
                    ))}
                </div>
            </section>

            <section className="pagination" id="section-p1">
                {/* Previous Page Button */}
                <Link
                    to={getPaginationLink(currentPage - 1)}
                    className={`pagination-link ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={handlePrevPage}
                >
                    <FontAwesomeIcon icon={faLongArrowAltLeft} />
                </Link>

                
                {/* Next Page Button */}
                <Link
                    to={getPaginationLink(currentPage + 1)}
                    className={`pagination-link ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={handleNextPage}
                >
                    <FontAwesomeIcon icon={faLongArrowAltRight} />
                </Link>
            </section>
        </>
    );
}
