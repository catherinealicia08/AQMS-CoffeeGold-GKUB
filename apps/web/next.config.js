/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/firebase-messaging-sw.js',
        destination: '/api/firebase-sw',
      },
    ];
  },
};

module.exports = nextConfig;
