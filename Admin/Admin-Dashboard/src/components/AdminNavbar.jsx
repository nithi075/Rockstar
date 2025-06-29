// components/Admin/AdminNavbar.jsx (or wherever your component is located)
import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false); // State to manage menu open/close

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when a link is clicked (useful for mobile UX)
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="Admin-Navbar">
        
      {/* Hamburger icon for mobile */}
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation menu">
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Navigation links - apply 'open' class when menu is active */}
      <div className={`nav-links-container ${isOpen ? 'open' : ''}`}>
        <NavLink to="/admin/dashboard" onClick={closeMenu}>Dashboard</NavLink>
        <NavLink to="/admin/products" onClick={closeMenu}>Products</NavLink>
        <NavLink to="/admin/orders" onClick={closeMenu}>Orders</NavLink>
      </div>
    </nav>
  );
}