// src/components/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBagShopping, faTimes, faOutdent, faSearch } from '@fortawesome/free-solid-svg-icons';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Search from './Search.jsx';

export default function Header({ cartItemCount }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchBarVisible, setIsMobileSearchBarVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const headerRef = useRef(null);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileSearchBarVisible(false); // Close search bar if menu is opened
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSearchToggle = (event) => {
    event.stopPropagation();
    setIsMobileSearchBarVisible((prev) => !prev);
    setIsMobileMenuOpen(false); // Close mobile menu if search bar is opened
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      navigate(`/shop?keyword=${searchTerm}`);
    } else {
      navigate('/shop');
    }
    setIsMobileSearchBarVisible(false);
    handleCloseMobileMenu();
  };

  const shouldRenderSearchComponent = () => {
    return location.pathname === '/' || location.pathname === '/shop';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search bar if visible AND click is outside the header
      if (isMobileSearchBarVisible && headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMobileSearchBarVisible(false);
      }
      // Also close the mobile menu if visible AND click is outside the navBar and menu toggle
      // This is a more robust way to handle clicks outside the menu
      const navBar = document.querySelector('.header .navBar');
      const menuToggle = document.getElementById('bar'); // Hamburger icon
      if (isMobileMenuOpen && navBar && !navBar.contains(event.target) && menuToggle && !menuToggle.contains(event.target)) {
          setIsMobileMenuOpen(false);
      }
    };

    // Add event listener only when either the search bar or the mobile menu is visible
    if (isMobileSearchBarVisible || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSearchBarVisible, isMobileMenuOpen]);


  return (
    <>
      <header className="header" id="section-p1" ref={headerRef}>
        <NavLink to="/" className="logo">
          <img src="logo.png" alt="Logo" />
        </NavLink>

        <div className="desktop-nav-and-search">
          {shouldRenderSearchComponent() && (
            <div className="search-container desktop-search-bar">
              <Search onSearch={handleSearch} />
            </div>
          )}
          <ul className={`navBar ${isMobileMenuOpen ? 'active' : ''}`}>
            <li><NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end onClick={handleCloseMobileMenu}>Home</NavLink></li>
            <li><NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleCloseMobileMenu}>Shop</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleCloseMobileMenu}>Contact</NavLink></li>
            <li id="lg-bag" className="cart-icon-container">
              <NavLink to="/cart" onClick={handleCloseMobileMenu}>
                <FontAwesomeIcon icon={faBagShopping} />
                {cartItemCount > 0 && (<span className="cart-badge">{cartItemCount}</span>)}
              </NavLink>
            </li>
            <a href="#" id="close" onClick={handleCloseMobileMenu} className={isMobileMenuOpen ? 'open' : ''}>
              <FontAwesomeIcon icon={faTimes} />
            </a>
          </ul>
        </div>

        {shouldRenderSearchComponent() && (
          <div className={`search-container mobile-inline-search ${isMobileSearchBarVisible ? 'active-inline-search' : ''}`}>
            <Search onSearch={handleSearch} />
          </div>
        )}

        {/* Modify the className here: 
            Add 'hide-mobile-icons' if either search bar is visible OR mobile menu is open.
        */}
        <div className={`mobile ${isMobileSearchBarVisible || isMobileMenuOpen ? 'hide-mobile-icons' : ''}`}>
          {/* Search Icon for mobile - now it directly toggles the inline search */}
          {shouldRenderSearchComponent() && (
            <FontAwesomeIcon
              id="search-icon-mobile"
              icon={faSearch}
              onClick={handleSearchToggle}
            />
          )}

          <NavLink to="/cart" className="cart-icon-container">
            <FontAwesomeIcon icon={faBagShopping} />
            {cartItemCount > 0 && (<span className="cart-badge">{cartItemCount}</span>)}
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