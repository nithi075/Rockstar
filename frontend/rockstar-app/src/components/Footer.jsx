import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFacebookF,
    faTwitter,
    faInstagram,
    faPinterestP,
    faYoutube
} from '@fortawesome/free-brands-svg-icons'; 

export default function Footer() {
    return (
        <>
            <footer id="section-p1">
                <div className="col">
                    <img src="/logo.png" className="logo" alt="Company Logo" /> {/* Add alt text for accessibility */}
                    
                    <h4>Contact</h4>
                    <p><strong>Address:</strong> West Thillai Nagar,Tennur,Tiruchirappalli</p>
                    <p><strong>Phone:</strong> +91 88839 34786</p>
                    <p><strong>Hours:</strong> 9.30 AM -8.00 PM Mon-Sat</p>
                    
                    <div className="follow">
                        <h4>Follow Us</h4>
                        <div className="icon">
                            {/* Changed to use FontAwesomeIcon component */}
                            <FontAwesomeIcon icon={faFacebookF}  id='icons'/>
                            <FontAwesomeIcon icon={faTwitter} id='icons'/>
                            <FontAwesomeIcon icon={faInstagram} id='icons'/>
                            <FontAwesomeIcon icon={faPinterestP} id='icons'/>
                            <FontAwesomeIcon icon={faYoutube} id='icons' />
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}