import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import images from your assets folder (adjust paths as needed)
import shirtImage from '../assets/img/features/shirt.jpg';
import tShirtImage from '../assets/img/features/tshirt.jpg';
import checkedShirtImage from '../assets/img/features/checkedshirt.jpg';
import pantsImage from '../assets/img/features/pants.jpg';
import tracksImage from '../assets/img/features/tracks.jpg';
import shortsImage from '../assets/img/features/shorts.jpg';
import formalPantsImage from '../assets/img/features/formalpants.jpg';
import jacketsImage from '../assets/img/features/jackets.jpg';


export default function Features(){
    const navigate = useNavigate();

    const handleCategoryClick = (categoryName) => {
        // Construct the URL with a query parameter for category
        // Ensure the categoryName here matches what's in your DB (case-insensitively due to backend regex)
        // For example, if DB has "T-Shirts", then pass 'T-Shirts' here.
        // Or standardize DB to "t-shirts" and pass 't-shirts'.
        // For simplicity, let's keep the exact string you want to search for.
        console.log(`Features.jsx: Navigating to /shop?category=${categoryName}`);
        navigate(`/shop?category=${categoryName}`);
    };

    return(
        <section className="feature" id="section-p1" >
            <h2>Featured Products</h2>
            <p>Various Collection With New Modern Design</p>
            <div className="pro-container">
                {/* Each product category div now has an onClick handler */}
                {/* IMPORTANT: The string passed to handleCategoryClick MUST match the category name in your DB (case-insensitively) */}
                <div className="pro" onClick={() => handleCategoryClick('Shirts')}>
                    <img src={shirtImage} alt="Shirt" />
                    <h4>SHIRTS</h4>
                </div>
                <div className="pro" onClick={() => handleCategoryClick('T-Shirts')}>
                    <img src={tShirtImage} alt="T-Shirt" />
                    <h4>T-SHIRTS</h4>
                </div>
                {/* Changed "Oversized Shirts" to "Checked Shirts" to match image naming, adjust if your DB has "Oversized Shirts" */}
                <div className="pro" onClick={() => handleCategoryClick('Oversized-Shirts')}>
                    <img src={checkedShirtImage} alt="Oversized Shirt" />
                    <h4>OVERSIZED SHIRTS</h4>
                </div>
                <div className="pro" onClick={() => handleCategoryClick('Pants')}>
                    <img src={pantsImage} alt="Pants" />
                    <h4>PANTS</h4>
                </div>
                <div className="pro" onClick={() => handleCategoryClick('Track Pants')}>
                    <img src={tracksImage} alt="Track Pants" />
                    <h4>TRACK PANTS</h4>
                </div>
                <div className="pro" onClick={() => handleCategoryClick('Shorts')}>
                    <img src={shortsImage} alt="Shorts" />
                    <h4>SHORTS</h4>
                </div>
                <div className="pro" onClick={() => handleCategoryClick('Formal Pants')}>
                    <img src={formalPantsImage} alt="Formal Pants" />
                    <h4>FORMAL PANTS</h4>
                </div>
                <div className="pro" onClick={() => handleCategoryClick('Jackets')}>
                    <img src={jacketsImage} alt="Jackets" />
                    <h4>JACKETS</h4>
                </div>
            </div>
        </section>
    )
}