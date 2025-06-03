// src/components/ProductList.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    // Helper to safely get the product ID (if not already done in App.jsx)
    const getProductId = (productData) => {
        if (!productData || !productData._id) return null;
        if (typeof productData._id === 'object' && productData._id.$oid) return productData._id.$oid;
        if (typeof productData._id === 'string') return productData._id;
        return null;
    };

    // Ensure product.images[0].url exists and is correctly formatted
    // For example, if your backend stores 'uploads/shirt.jpg', the src should be '/uploads/shirt.jpg'
    // This assumes your public folder serves images from `public/uploads/`
    const imageUrl = product.images && product.images.length > 0
        ? `/${product.images[0].url}` // Assuming URL is like 'uploads/myimage.jpg'
        : '/images/placeholder.jpg'; // Fallback placeholder image

    return (
        <Link to={`/product/${getProductId(product)}`} className="products" >
            <div className="pro" >
                <img src={imageUrl} alt={product.name} />
                <div className="des">
                    <span>{product.brand}</span> {/* Assuming you have a brand field */}
                    <h5>{product.name}</h5>
                    <div className="star">
                        {/* Render stars based on product.ratings if available */}
                        {/* Example: <i className="fas fa-star"></i> */}
                    </div>
                    <h4>₹{product.price}</h4>
                </div>
                {/* Add to cart icon (if it's part of the card, not just detail page) */}
                {/* <a href="#"><i className="fal fa-shopping-cart cart"></i></a> */}
            </div>
        </Link>
    );
};

export default ProductCard;