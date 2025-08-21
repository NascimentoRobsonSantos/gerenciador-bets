/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ignora erros de eslint no build
  },
  typescript: {
    ignoreBuildErrors: true, // ignora erros de typescript no build
  },
};

module.exports = nextConfig;
