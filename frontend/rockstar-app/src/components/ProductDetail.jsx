import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faStar } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import ProductShareLink from './ProductShareLink';

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

    const handleBuyNow = () => {
        if (!product) {
            toast.error("Product data not loaded. Cannot proceed with purchase.");
            return;
        }
        if (qty < 1) {
            toast.warn("Quantity must be at least 1 to buy now.");
            return;
        }
        if (!selectedSize) {
            toast.warn("Please select a size to buy now.");
            return;
        }

        const selectedSizeObject = product.sizes.find(s => s.size === selectedSize);

        if (!selectedSizeObject || selectedSizeObject.stock === 0) {
            toast.error(`The selected size (${selectedSize}) is currently out of stock.`);
            return;
        }

        if (qty > selectedSizeObject.stock) {
            toast.warn(`Cannot buy ${qty} of size ${selectedSize}. Only ${selectedSizeObject.stock} available.`);
            setQty(selectedSizeObject.stock); // Optionally adjust quantity to max available
            return;
        }

        const currentProductId = getProductId(product);
        if (!currentProductId) {
            console.error("handleBuyNow: Could not determine valid product ID for current product:", product);
            toast.error("Could not proceed with purchase due to product ID error.");
            return;
        }

        // Add the item to the cart (or a temporary 'buy now' list)
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => {
                const itemProductId = getProductId(item.product);
                return itemProductId === currentProductId && item.size === selectedSize;
            });

            if (existingItem) {
                if (existingItem.qty + qty > selectedSizeObject.stock) {
                    toast.warn(`Adding ${qty} more would exceed stock for size ${selectedSize}. You already have ${existingItem.qty} in cart. Max available: ${selectedSizeObject.stock}`);
                    return prevCart; // Don't modify cart if it exceeds stock
                }
                const updatedCart = prevCart.map(item =>
                    (getProductId(item.product) === currentProductId && item.size === selectedSize)
                        ? { ...item, qty: item.qty + qty }
                        : item
                );
                // toast.success(`Updated quantity for ${product.name} (Size: ${selectedSize}) in cart for immediate purchase!`);
                return updatedCart;
            } else {
                const newCart = [...prevCart, { product, qty, size: selectedSize }];
                // toast.success(`${product.name} (Size: ${selectedSize}, Qty: ${qty}) added to cart for immediate purchase!`);
                return newCart;
            }
        });

        toast.success(`Redirecting to cart with ${qty} of ${product.name} (Size: ${selectedSize})!`);
        // Navigate to the cart page.
        navigate('/cart'); // Changed from '/checkout' to '/cart'
    };


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

    const desiredCount = 8;

    const unrelatedProducts = allProducts.filter(p => {
        const pId = getProductId(p);
        const currentId = getProductId(product);
        const pBaseCustomId = getBaseCustomId(p.customId);

        return pId !== currentId && pBaseCustomId !== currentProductBaseIdForRelated;
    });

    const randomFill = [...unrelatedProducts].sort(() => 0.5 - Math.random()).slice(0, desiredCount);
    productsToDisplay = randomFill;

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
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}> {/* Flex container for buttons */}
                        <button
                            className="normal"
                            onClick={addToCart}
                            disabled={currentSizeStock === 0 || !selectedSize || qty === 0 || qty > currentSizeStock}
                        >
                            Add to Cart
                        </button>
                        <button
                            className="normal" // You might want a different class for styling "Buy Now"
                            onClick={handleBuyNow}
                            disabled={currentSizeStock === 0 || !selectedSize || qty === 0 || qty > currentSizeStock}
                        >
                            Buy Now
                        </button>
                    </div>

                    <h4 style={{ paddingTop: "5px", fontSize: "25px", paddingBottom: "0px" }}>Product Details</h4>
                    <span>{product.description}</span>

                    <ProductShareLink
                        productId={id}
                        productName={product.name}
                        productDescription={product.description}
                    />
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
                <section className="feature" id="section-p1" style={{ paddingTop: "5px" }}>
                    <h2 style={{ paddingBottom: "0", lineHeight: "0px", fontSize: "25px" }}>You might also like</h2>

                    <div className="pro-container" style={{ paddingTop: "5px" }}>
                        {finalProductsToDisplay.map(relatedProduct => (
                            <Link to={`/product/${getProductId(relatedProduct)}`} key={getProductId(relatedProduct)} className="pro-link-wrapper">
                                <div className="pro">
                                    <div className="image-wrapper">
                                        <img src={relatedProduct.images && relatedProduct.images.length > 0 ? `/${relatedProduct.images[0].url}` : 'img/products/f1.jpg'} alt={relatedProduct.name} />
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
