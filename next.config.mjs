/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'switchcode.tech', 'ui-avatars.com', 'images.unsplash.com', 'drive.google.com', 'lh3.googleusercontent.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
