/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security header (allow stripe + only same-origin connect)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' https://js.stripe.com; " +
              "connect-src 'self' https://api.stripe.com wss:; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data:; " +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },

  // Proxy all /api/* requests to your EC2 backend's /api/* paths
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://52.3.153.225:1337/api/:path*",
      },
    ];
  },
};

export default nextConfig;
