// src/pages/Admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import api from '../../axios'; // <--- CHANGE THIS: Import your custom Axios instance 'api'
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
            // <--- CHANGE THIS: Use your custom 'api' instance for the login request
            const response = await api.post('/users/login', { email, password }); // Use relative path since baseURL is set in api.js

            if (response.data.success) {
                // <--- ADD THIS: Store the token in localStorage
                localStorage.setItem('authToken', response.data.token);
                // The api.interceptors.request.use will now automatically pick this up
                // for all subsequent requests made with the 'api' instance.

                alert('Login Successful!');
                console.log("Login Response Data:", response.data);
                navigate('/admin/dashboard'); // Redirect to admin dashboard on success
            } else {
                setError(response.data.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'An unexpected error occurred during login.');
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
