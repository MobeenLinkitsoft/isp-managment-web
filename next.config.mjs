const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production'
              ? "script-src 'self' https://js.stripe.com; frame-src 'self' https://js.stripe.com; connect-src 'self' https://api.stripe.com"
              : "script-src 'self' 'unsafe-eval' https://js.stripe.com; frame-src 'self' https://js.stripe.com; connect-src 'self' https://api.stripe.com",
          },
        ],
      },
    ]
  },
}

export default nextConfig;
