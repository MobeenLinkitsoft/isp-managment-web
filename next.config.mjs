/** @type {import('next').NextConfig} */
const nextConfig = {
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
              "connect-src 'self' http://35.173.229.177:1337 https://api.stripe.com wss:; " +
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

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://35.173.229.177:1337/:path*", // your backend
      },
    ];
  },
};

export default nextConfig;
