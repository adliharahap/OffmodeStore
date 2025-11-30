/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: [
        'thundering-gael-brackish.ngrok-free.dev' 
      ],
    },
  },
};

export default nextConfig;