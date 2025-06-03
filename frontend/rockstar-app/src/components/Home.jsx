import React, { useState, useEffect } from 'react';
import Arrivals from "./Arrivals";
import Banner from "./Banner";
import Features from "./Features";
import Instagram from './Instagram';

export default function Home() {
    // State to hold the height of the hero section
    const [heroHeight, setHeroHeight] = useState('90vh'); // Default height for larger screens

    // Effect hook to run once on mount and on window resize
    useEffect(() => {
        // Function to determine and set the hero height
        const handleResize = () => {
            if (window.innerWidth <= 786) {
                setHeroHeight('25vh'); // Height for screens <= 786px
            } else {
                setHeroHeight('100vh'); // Height for screens > 786px
            }
        };

        // Call handler right away so state gets updated with initial window size
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup: remove event listener when the component unmounts
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    return (
        <>
            <section>
                <div style={{
                    backgroundImage: "url('hero4.png')", // Ensure your image path is correct
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: heroHeight, // Dynamically set height from state
                    width: '100%', // Make sure it takes full width
                    // Add any other default styles here
                }}>
                    {/* Content that goes on top of the background image */}
                </div>
            </section>
            <Features/>
            <Banner/>
            <Arrivals/>
            <Instagram/>
        </>
    );
}