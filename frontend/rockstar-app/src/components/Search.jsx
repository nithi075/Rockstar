// src/components/Search.jsx
import React, { useState } from 'react';

export default function Search({ onSearch }) {
    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        if (onSearch) {
            onSearch(keyword.trim()); // Call the onSearch prop with the current keyword
        }
        setKeyword(""); // <--- ADD THIS LINE: Clear the input field after search
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="input-group">
            <label htmlFor="search_field" className="visually-hidden">Search</label>
            <input
                type="text"
                id="search_field"
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyPress}
                value={keyword} // Control the input value
                className="form-control"
                placeholder="Enter Product Name ..."
                
            />
            {/* If you have a search button inside this component, you'd add it here */}
            {/* For example: */}
            {/* <div className="input-group-append">
                <button className="btn" type="button" onClick={handleSearch}>
                    <i className="fa fa-search"></i>
                </button>
            </div> */}
        </div>
    );
}