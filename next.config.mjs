/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Disable TypeScript type checking during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig; 