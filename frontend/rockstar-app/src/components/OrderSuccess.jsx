// src/pages/OrderSuccess.jsx

import  { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Helper function for IST formatting
const formatUtcToIST = (utcDateString) => {
    if (!utcDateString) return 'N/A';

    // The Date constructor should correctly parse ISO strings like "2025-05-24T09:25:00.448Z"
    // or even a string like "2025-05-24T09:25:00.448+00:00"
    const date = new Date(utcDateString);

    // Check if the date parsing was successful
    if (isNaN(date.getTime())) {
        console.error("formatUtcToIST: Invalid date string provided:", utcDateString);
        return 'Invalid Date';
    }

    const options = {
        timeZone: 'Asia/Kolkata', // This is crucial for IST
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true // For AM/PM format
    };

    return date.toLocaleString('en-IN', options);
};

export default function OrderSuccess() {
    const location = useLocation();
    const { orderId, createdAt, orderedItems, totalAmount, customerDetails } = location.state || {};

    // For debugging: see what data is received
    useEffect(() => {
        console.log("OrderSuccess.jsx: Received state from navigation:", location.state);
        if (createdAt) {
            console.log("OrderSuccess.jsx: Raw createdAt string:", createdAt);
            console.log("OrderSuccess.jsx: Formatted IST time:", formatUtcToIST(createdAt));
        }
        if (orderedItems) {
            console.log("OrderSuccess.jsx: Received orderedItems:", orderedItems);
        }
    }, [location.state, orderId, createdAt, orderedItems, totalAmount, customerDetails]);


    if (!orderId || !orderedItems || orderedItems.length === 0 || !customerDetails) {
        return (
            <section className="order-success-page" style={{ textAlign: 'center', padding: '50px 20px' }}>
                <h2>Order Details Not Available</h2>
                <p>Could not retrieve order details. This might happen if you refresh the page directly or navigate without placing an order.</p>
                <p>Please <Link to="/cart">go back to cart</Link> or <Link to="/shop">continue shopping</Link>.</p>
            </section>
        );
    }

    return (
        <section className="order-success-page" style={{ textAlign: 'center', padding: '50px 20px' ,backgroundColor:"#f7b08c"}}>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your purchase.</p>
            <p>Your order has been successfully placed.</p>

            <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fdf4dc' }}>
                <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>Order ID: <strong>{orderId}</strong></p>
                <p style={{paddingBottom :"5px"}}>Order Placed On: <strong>{formatUtcToIST(createdAt)}</strong></p>

                <h4 style={{ marginTop: '10px', borderBottom: '1px solid #eee' }}>Ordered Products</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {orderedItems.map((item, index) => (
                        <li key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dotted #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '500' }}>{item.name}</span>
                            {item.size && <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>(Size: {item.size})</span>}
                            <span style={{ fontWeight: 'bold' }}>${(item.qty * parseFloat(item.price)).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>

                <h3 style={{ marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Summary</h3>
                <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Total Amount: <span style={{ color:"#35396d" }}>${totalAmount.toFixed(2)}</span></p>

                
            </div>

            <Link to="/shop" className="tot-button" style={{ marginTop: '30px', display: 'inline-block' }}>Continue Shopping</Link>
        </section>
    );
}