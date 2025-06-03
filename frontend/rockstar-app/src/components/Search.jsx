// src/components/Search.jsx
import React, { useState } from 'react';
// Removed useNavigate as it's not needed here.
// The navigation will be handled by the parent component (Header).

export default function Search({ onSearch }) { // Accept onSearch prop
    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        // Call the onSearch prop with the current keyword
        if (onSearch) {
            onSearch(keyword.trim()); // Trim whitespace
        }
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
                onKeyDown={handleKeyPress} // Use onKeyDown for Enter key
                value={keyword} // Control the input value
                className="form-control"
                placeholder="Enter Product Name ..."
            />
    
        </div>
    );
}