import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Create this file for basic styling

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Admin Panel</h2>
            </div>
            <ul className="sidebar-menu">
                <li>
                    <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                        Products
                    </NavLink>
                </li>
                {/* Add more links for other admin functionalities relevant to this frontend */}
                <li>
                    <NavLink to="/admin/product/new" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                        Create Product
                    </NavLink>
                </li>
                {/* Example for other admin pages: */}
                {/* <li>
                    <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                        Orders
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                        Users
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/reviews" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                        Reviews
                    </NavLink>
                </li> */}
            </ul>
        </div>
    );
};

export default Sidebar;