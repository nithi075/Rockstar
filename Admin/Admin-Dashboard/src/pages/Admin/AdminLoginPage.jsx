// src/pages/Admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import api from '../../axios'; // IMPORT YOUR CUSTOM AXIOS INSTANCE
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // CORRECTED: Use your custom 'api' instance instead of 'axios'
            // This ensures baseURL and withCredentials are applied
            const response = await api.post('/users/login', { email, password });

            if (response.data.success) {
                alert('Login Successful!');
                console.log("Login Response Data:", response.data);
                // Navigate to the frontend's admin dashboard route
                navigate('/admin/dashboard');
            } else {
                // Backend sent a success: false, along with a message
                setError(response.data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            // More robust error handling for network errors or server responses
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Error response data:", err.response.data);
                console.error("Error response status:", err.response.status);
                console.error("Error response headers:", err.response.headers);
                setError(err.response.data.message || `Login failed. Server responded with status ${err.response.status}.`);
            } else if (err.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an http.ClientRequest in node.js
                console.error("Error request:", err.request);
                setError('No response from server. Please check your internet connection or server status.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', err.message);
                setError('An unexpected error occurred during login setup.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Login">
            <div className="Login-page">
                <h2>Admin Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="Login-email">Email address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="email-input"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="Password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="Passwrd-input"
                            placeholder="Enter your password"
                        />
                    </div>
                    {error && (
                        <div className="Error-password">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="Login_button"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
