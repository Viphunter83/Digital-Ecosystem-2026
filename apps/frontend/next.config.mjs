/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable dev indicators on mobile
    devIndicators: {
        buildActivity: false,
        appIsrStatus: false,
    },
    output: 'standalone',
    trailingSlash: false,
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
                protocol: 'https',
                hostname: 'admin.td-rss.ru',
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
        const backendUrl = process.env.BACKEND_URL || 'http://backend:8000';
        const directusUrl = process.env.DIRECTUS_URL || 'http://directus:8055';

        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/:path*`,
            },
            {
                source: '/uploads/:path*',
                destination: `${backendUrl}/uploads/:path*`,
            },
            {
                source: '/assets/:path*',
                destination: `${directusUrl}/assets/:path*`,
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/projects',
                destination: '/solutions',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
