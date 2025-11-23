/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Atur limit ke 10MB (atau sesuai kebutuhan)
    },
  },
};

export default nextConfig;