/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable dev indicators on mobile
    devIndicators: {
        buildActivity: false,
        appIsrStatus: false,
    },
    output: 'standalone',
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8055',
            },
            {
                protocol: 'http',
                hostname: 'backend',
                port: '8000',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/:path*` : 'http://localhost:8000/:path*', // Proxy to Backend
            },
            {
                source: '/uploads/:path*',
                destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/uploads/:path*` : 'http://localhost:8000/uploads/:path*', // Proxy Uploads
            },
        ];
    },
};

export default nextConfig;
