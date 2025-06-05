import  { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

// Define your frontend base URL once here.
// IMPORTANT: Make sure this matches your deployed Render frontend URL.
const FRONTEND_BASE_URL = 'https://rockstar-fcga.onrender.com';

const ProductShareLink = ({ productId, productName, productDescription }) => {
    const [productShareUrl, setProductShareUrl] = useState('');

    useEffect(() => {
        if (productId) {
            setProductShareUrl(`${FRONTEND_BASE_URL}/product/${productId}`);
        } else {
            setProductShareUrl('');
        }
    }, [productId]);

    const handleShareClick = async () => {
        if (!productShareUrl) {
            toast.error("Product link not ready for sharing.");
            return;
        }

        const title = productName || "Check out this product";
        const text = productDescription ? `Check out this amazing product: ${productName} - ${productDescription}` : `Check out this amazing product: ${productName}`;

        try {
            if (navigator.share) {
                // Web Share API
                await navigator.share({
                    title: title,
                    text: text,
                    url: productShareUrl,
                });
                toast.success("Product shared successfully!");
            } else if (navigator.clipboard) {
                // Clipboard API fallback
                await navigator.clipboard.writeText(productShareUrl);
                toast.success("Product link copied to clipboard!");
            } else {
                // Prompt fallback
                prompt("Copy this link to share:", productShareUrl);
            }
        } catch (error) {
            console.error("Error sharing product:", error);
            if (error.name !== 'AbortError') { // User cancelled share
                toast.error("Failed to share product.");
            } else {
                console.log("Product sharing aborted by user.");
            }
        }
    };

    if (!productId) {
        return null; // Don't render if there's no product ID
    }

    return (
        <button
            className="share-btn"
            onClick={handleShareClick}
            style={{
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
            }}
        >
            Share <FontAwesomeIcon icon={faShareAlt} />
        </button>
    );
};

export default ProductShareLink;
