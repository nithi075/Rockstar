import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rockstar-fcga.onrender.com', // **This is your backend's domain**
        port: '', // Leave empty if no specific port
        pathname: '/Products/**', // Or a more general '/public/**' or specific '/Products/Gurkha_Pant_Black.png' path if needed
      },
      // If you have other external image sources, add them here
    ],
  },
};

export default nextConfig;
