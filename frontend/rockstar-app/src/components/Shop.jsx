import { useEffect, useState, useRef } from "react";
import ProductCard from "../components/ProductList";
import { useSearchParams, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltRight, faLongArrowAltLeft } from '@fortawesome/free-solid-svg-icons';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    const currentCategory = searchParams.get('category');
    const currentKeyword = searchParams.get('keyword');

    const prevCategoryRef = useRef(currentCategory);
    const prevKeywordRef = useRef(currentKeyword);

    // Initialize currentPage from URL search param, or default to 1
    // This state will be updated by the useEffect when URL changes
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

    const [totalPages, setTotalPages] = useState(1);
    const productsPerPage = 12;

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

        const isNewCategory = currentCategory !== prevCategoryRef.current;
        const isNewKeyword = currentKeyword !== prevKeywordRef.current;

        if (isNewCategory || isNewKeyword) {
            console.log("Shop.jsx: New category or keyword detected. Resetting to page 1.");
            // If category/keyword changed, we need to update the URL to page 1
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('page', '1');
            setSearchParams(newSearchParams); // This will cause a re-render and trigger the fetch
            setCurrentPage(1); // Also update internal state immediately
        } else if (currentPage !== pageFromUrl) {
            // Only update currentPage state if it doesn't match the URL (e.g., from browser back/forward, or direct URL entry)
            setCurrentPage(pageFromUrl);
        }

        prevCategoryRef.current = currentCategory;
        prevKeywordRef.current = currentKeyword;

    }, [location.search, searchParams, currentCategory, currentKeyword, setCurrentPage, setSearchParams]); // Depend on setCurrentPage and setSearchParams if they were defined outside

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                let url = `http://localhost:8000/api/v1/products?page=${currentPage}&limit=${productsPerPage}`;

                if (currentCategory) {
                    url += `&category=${currentCategory}`;
                    console.log(`Shop.jsx: Fetching by category: "${currentCategory}", Page: ${currentPage}`);
                } else if (currentKeyword) {
                    url += `&keyword=${currentKeyword}`;
                    console.log(`Shop.jsx: Fetching by search keyword: "${currentKeyword}", Page: ${currentPage}`);
                } else {
                    console.log(`Shop.jsx: Fetching all products, Page: ${currentPage}`);
                }

                console.log("Shop.jsx: Final API URL:", url);

                const response = await fetch(url);
                const data = await response.json();

                if (response.ok && data.success) {
                    setProducts(data.products);
                    setTotalPages(Math.ceil(data.totalProducts / productsPerPage));
                } else {
                    // If backend returns an error or no success, treat it as no products found for that filter/page
                    setError(data.message || 'Failed to fetch products.');
                    setProducts([]);
                    // IMPORTANT: If products are 0, totalPages should still reflect actual total if available,
                    // but if it's an error from the API, we reset to 1 as we don't know the true total.
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
    }, [currentPage, currentCategory, currentKeyword, productsPerPage]); // Added productsPerPage for completeness

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

    // Effect to scroll to top whenever the products change (after fetch)
    useEffect(() => {
        if (!loading && products.length > 0) { // Only scroll when products are loaded and available
            window.scrollTo(0, 0);
        }
    }, [products, loading]); // Depend on products and loading state

    const currentFilterTerm = currentCategory || currentKeyword;

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

    if (products.length === 0) {
        return (
            <>
                <section className="products" id="section-p1">
                    <div style={{ textAlign: 'center', padding: '60px 20px', marginBottom: "95px", marginTop: "95px" }}>
                        <p style={{ fontSize: '1.7em', fontWeight: 'bold', color: '#333', lineHeight: "35px" }}>
                            No products found
                            {currentFilterTerm && (
                                <> for "<span style={{ color: '#35396d' }}>{currentFilterTerm}</span>"</>
                            )}
                            .
                        </p>
                        <p style={{ fontSize: '1.2em', color: '#666', marginTop: '15px', lineHeight: "30px" }}>
                            Please try a different {currentFilterTerm ? 'filter' : 'search term'} or browse our <Link to="/shop" style={{ color: '#35396d', textDecoration: 'underline', textDecoration: "none" }}>Entire collection</Link>.
                        </p>
                    </div>
                </section>
            </>
        );
    }

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
                {currentPage > 1 ? (
                    <Link
                        to={getPaginationLink(currentPage - 1)}
                        className="pagination-link"
                        // Added onClick here to ensure immediate scroll
                        onClick={() => window.scrollTo(0, 0)}
                    >
                        <FontAwesomeIcon icon={faLongArrowAltLeft} />
                    </Link>
                ) : (
                    <span className="pagination-link disabled">
                        <FontAwesomeIcon icon={faLongArrowAltLeft} />
                    </span>
                )}

                <span className="current-page-display">{currentPage} / {totalPages}</span>


                {/* Next Page Button */}
                {currentPage < totalPages ? (
                    <Link
                        to={getPaginationLink(currentPage + 1)}
                        className="pagination-link"
                        // Added onClick here to ensure immediate scroll
                        onClick={() => window.scrollTo(0, 0)}
                    >
                        <FontAwesomeIcon icon={faLongArrowAltRight} />
                    </Link>
                ) : (
                    <span className="pagination-link disabled">
                        <FontAwesomeIcon icon={faLongArrowAltRight} />
                    </span>
                )}
            </section>
        </>
    );
}