// src/pages/ProductShareLink.jsx
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const ProductShareLink = ({ productId, productName, productDescription }) => {
    const [productShareUrl, setProductShareUrl] = useState('');

    useEffect(() => {
        if (productId) {
            const currentOrigin = window.location.origin;
            setProductShareUrl(`${currentOrigin}/product/${productId}`);
            console.log("Generated share URL:", `${currentOrigin}/product/${productId}`);
        } else {
            setProductShareUrl('');
        }
    }, [productId]);

    const handleShareClick = async () => {
        if (!productShareUrl) {
            toast.error("Product link not ready for sharing.");
            return;
        }

        // --- MODIFIED LOGIC HERE ---
        try {
            // Option 1: Always try to copy to clipboard directly if you prefer that over native share dialog
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(productShareUrl);
                toast.success("Product link copied to clipboard!");
            }
            // Option 2: If you still want native share as primary, keep the original
            // else if (navigator.share) { // Original logic for native share dialog
            //     const title = productName || "Check out this product";
            //     const text = productDescription ? `Check out this amazing product: ${productName} - ${productDescription}` : `Check out this amazing product: ${productName}`;
            //     await navigator.share({
            //         title: title,
            //         text: text,
            //         url: productShareUrl,
            //     });
            //     toast.success("Product shared successfully!"); // This toast appears in your current setup
            // }
            else { // Fallback to prompt if neither clipboard nor native share are available
                prompt("Copy this link to share:", productShareUrl);
            }
        } catch (error) {
            console.error("Error sharing product:", error);
            if (error.name !== 'AbortError') { // User cancelled share dialog
                toast.error("Failed to share product.");
            } else {
                console.log("Product sharing aborted by user.");
            }
        }
    };

    if (!productId) {
        return null;
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
