import React from 'react';
import Sidebar from './Sidebar.jsx'; // Make sure this path is correct

const AdminLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            {/* The Sidebar for the Main Frontend's Admin Section */}
            <Sidebar />

            {/* Main content area for Admin Routes */}
            <div style={{ flexGrow: 1, padding: '20px', marginLeft: '250px', boxSizing: 'border-box' }}>
                {children} {/* This will render the nested <Routes> from App.jsx */}
            </div>
        </div>
    );
};

export default AdminLayout;