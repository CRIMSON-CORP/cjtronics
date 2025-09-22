module.exports = {
  // reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cjtronics.tushcode.com',
      },
      {
        protocol: 'https',
        hostname: 'cjtronics.errandexpress.com.ng',
      },
      {
        protocol: 'https',
        hostname: 'cjtronics-api.com.ng',
      },
    ],
  },
  staticPageGenerationTimeout: 100,
};
