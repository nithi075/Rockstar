import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faEnvelope, faPhoneAlt, faClock } from '@fortawesome/free-solid-svg-icons';
// Import brand icons separately
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'; // Import brand icons
import Instagram from './Instagram';

export default function Contact() {
  return (
    <>
      <section className="contact-details" id="section-p1">
        <div className="details">
          <span>GET IN TOUCH</span>
          <h2>Visit our Shop locations or contact us today </h2>
          <h3>Our Shop</h3>
          <div className='rock-details'>
            <li>
             
              <FontAwesomeIcon icon={faMap} />
              <p>West Thillai Nagar,Tennur,Tiruchirappalli</p>
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} />
              <p>rockstarmenswear@gmail.com</p>
            </li>
            <li>
              <FontAwesomeIcon icon={faPhoneAlt} />
              <p> +91 88839 34786</p>
            </li>
            <li>
              <FontAwesomeIcon icon={faClock} />
              <p>Monday to Sunday 9.30 am to 10 pm</p>
            </li>
            <li>
              {/* Using brand icon: faInstagram */}
              <FontAwesomeIcon icon={faInstagram} />
              <a href="https://www.instagram.com/rock_star_trichy_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                <p>rock_star_trichy_</p>
              </a>
            </li>
            <li>
              {/* Using brand icon: faWhatsapp */}
              <FontAwesomeIcon icon={faWhatsapp} />
              <p> +91 88839 34786</p>
            </li>
          </div>
        </div>
        <div className="map">
         
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.9201913253205!2d78.6834247!3d10.817419500000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baaf5a09749ea33%3A0xa000842310acdcd0!2sRock%20Star!5e0!3m2!1sen!2sin!4v1748343323783!5m2!1sen!2sin"
            width="600"
            height="450"
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade" 
            title="Our Shop Location" 
          ></iframe>
        </div>
     
      </section>
         <Instagram/>
    </>
  );
}