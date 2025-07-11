import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from '../../axios';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 15;
    // New state for sorting
    const [sortBy, setSortBy] = useState('createdAt_desc'); // Default: newest first

    // useCallback to memoize the fetchProducts function, preventing unnecessary re-creations
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null); // Clear previous errors
        try {
            // Split sortBy into field and order (e.g., 'createdAt' and 'desc')
            const [sortField, sortOrder] = sortBy.split('_');

            // Construct the API URL with new sort parameters
            const res = await api.get(
                `/products?page=${currentPage}&limit=${productsPerPage}&keyword=${searchQuery}&sortField=${sortField}&sortOrder=${sortOrder}`
            );
            setProducts(res.data.products);
            setTotalProducts(res.data.totalCount);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products. " + (err.response?.data?.message || err.message || "Please try again."));
        } finally {
            setLoading(false);
        }
    }, [currentPage, productsPerPage, searchQuery, sortBy]); // Add sortBy to dependencies

    // useEffect to call fetchProducts when dependencies change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handles search action, resets page to 1 and updates searchQuery
    const handleSearch = () => {
        setCurrentPage(1);
        setSearchQuery(searchTerm);
    };

    // Handles product deletion
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            try {
                await api.delete(`/products/admin/product/${id}`);
                alert("Product deleted successfully!");
                fetchProducts(); // Re-fetch products to update the list
            } catch (err) {
                console.error("Error deleting product:", err);
                alert("Failed to delete product. " + (err.response?.data?.message || err.message || "Please try again."));
            }
        }
    };

    // Handles sort change
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    return (
        <div className="product-list-container">
            <div className="product-list-header">
                <h2 className="product-list-title">Product List</h2>
                <Link
                    to="/admin/products/new"
                    className="add-product-button"
                >
                    Add New Product
                </Link>
            </div>

            <div className="product-controls"> {/* New div for search and sort */}
                <div className="product-search-bar">
                    <input
                        type="text"
                        placeholder="Search product by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                        className="search-input"
                    />
                    <button
                        onClick={handleSearch}
                        className="search-button"
                    >
                        Search
                    </button>
                </div>

                {/* New Sort Dropdown */}
                <div className="product-sort-by">
                    <label htmlFor="sortOrder">Sort By: </label>
                    <select
                        id="sortOrder"
                        value={sortBy}
                        onChange={handleSortChange}
                        className="sort-select"
                    >
                        <option value="createdAt_desc">Newest First (Import Date)</option>
                        <option value="createdAt_asc">Oldest First (Import Date)</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name_asc">Name: A-Z</option>
                        <option value="name_desc">Name: Z-A</option>
                    </select>
                </div>
            </div>


            {loading ? (
                <div className="loading-message">Loading products...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <>
                    <div className="product-table-wrapper">
                        <table className="product-table">
                            <thead>
                                <tr className="product-table-header-row">
                                    <th className="product-table-th product-image-col">Image</th>
                                    <th className="product-table-th product-name-col">Name</th>
                                    <th className="product-table-th product-price-col">Price</th>
                                    <th className="product-table-th product-actions-col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="no-products-found">
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const imageUrl =
                                            product.images && product.images.length > 0
                                                ? `https://admin-backend-x8of.onrender.com/uploads/${product.images[0].url}`
                                                : "/placeholder.jpg"; // Fallback placeholder image

                                        return (
                                            <tr key={product._id} className="product-table-row">
                                                <td data-label="Image:" className="product-table-td product-image-cell">
                                                    <img
                                                        width={50}
                                                        height={50}
                                                        src={imageUrl}
                                                        alt={product.name}
                                                        className="product-thumbnail"
                                                    />
                                                </td>
                                                <td data-label="Name:" className="product-table-td product-name-cell">{product.name}</td>
                                                <td data-label="Price:" className="product-table-td product-price-cell">₹{product.price?.toFixed(2)}</td>

                                                <td data-label="Actions:" className="product-table-td product-actions-cell">
                                                    <div className="product-action-buttons">
                                                        <Link
                                                            to={`/admin/products/edit/${product._id}`}
                                                            className="edit-product-button"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(product._id)}
                                                            className="delete-product-button"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                className="pagination-button prev-button"
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page <span className="current-page-number">{currentPage}</span> of <span className="total-pages-number">{totalPages}</span>
                            </span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                className="pagination-button next-button"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
