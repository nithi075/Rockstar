import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBagShopping, faTimes, faOutdent } from '@fortawesome/free-solid-svg-icons';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Search from './Search.jsx';
// Make sure you import your CSS file (e.g., './style.css' or './Header.css')
// import './style.css'; // Assuming your CSS is in style.css or similar

// Corrected: Destructure 'cartItemCount' from the props object
export default function Header({ cartItemCount }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      navigate(`/shop?keyword=${searchTerm}`);
    } else {
      navigate('/shop');
    }
    // Optionally close the mobile menu after a search
    handleCloseMobileMenu();
  };

  const shouldShowSearch = () => {
    return location.pathname === '/' || location.pathname === '/shop';
  };

  // The 'addCart' function is not needed here in Header.
  // The Header component only needs to *display* the cart count,
  // not add items to the cart. Cart adding logic belongs in
  // ProductDetail or Shop components.

  return (
    <>
      <header className="header " id="section-p1">
        <NavLink to="/" className="logo">
          <img src="logo.png" alt="Logo" />
        </NavLink>
        {/* This div now acts as the container for the search bar and the mobile icons */}
        <div>
          {shouldShowSearch() && (
            <div className="search-container">
              <Search onSearch={handleSearch} />
            </div>
          )}
          {/* The main navigation menu for desktop/larger screens, hidden or off-screen on mobile */}
          <ul className={`navBar ${isMobileMenuOpen ? 'active' : ''}`}>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'active' : '')}
                end
                onClick={handleCloseMobileMenu} 
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/shop"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={handleCloseMobileMenu} 
              >
                Shop
              </NavLink>
            </li>
           
           
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={handleCloseMobileMenu} 
              >
                Contact
              </NavLink>
            </li>
            {/* Desktop cart icon (will be hidden on mobile by CSS) */}
            <li id="lg-bag" className="cart-icon-container">
              <NavLink to="/cart" onClick={handleCloseMobileMenu}> {/* Close menu on link click */}
                <FontAwesomeIcon icon={faBagShopping} />
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </NavLink>
            </li>
            {/* Close button for the mobile navigation menu */}
            <a
              href="#"
              id="close"
              onClick={handleCloseMobileMenu}
              className={isMobileMenuOpen ? 'open' : ''}
            >
              <FontAwesomeIcon icon={faTimes} />
            </a>
          </ul>
        </div>

        {/* Mobile icons (shopping bag and hamburger) that are always visible */}
        <div className="mobile">
          <NavLink to="/cart" className="cart-icon-container">
            <FontAwesomeIcon icon={faBagShopping} />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </NavLink>
          <FontAwesomeIcon
            id="bar"
            icon={faOutdent}
            onClick={handleMobileMenuToggle}
          />
        </div>
      </header>
    </>
  );
}