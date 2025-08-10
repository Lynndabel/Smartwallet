/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
    experimental: {
      externalDir: true,
    },
    // Environment variables
    env: {
      NEXT_PUBLIC_APP_NAME: 'SmartWallet',
      NEXT_PUBLIC_APP_DESCRIPTION: 'Send crypto using phone numbers',
      NEXT_PUBLIC_NETWORK_NAME: 'Morph Testnet',
      NEXT_PUBLIC_CHAIN_ID: '2810',
    },
    
    // Performance settings
    swcMinify: true,
    compress: true,
    poweredByHeader: false,
    trailingSlash: false,
    reactStrictMode: true,
  }
  
  module.exports = nextConfig