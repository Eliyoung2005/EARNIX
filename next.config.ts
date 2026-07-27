import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['bcryptjs'],
  // Allow all tunnel domains for testing
  allowedDevOrigins: [
    'romance-group-dreams-representation.trycloudflare.com',
    '*.trycloudflare.com',
    'which-demonstrates-approach-suggested.trycloudflare.com',
    'alaska-roof-served-aurora.trycloudflare.com',
    'earnix-pro-testing.loca.lt', 
    'shiny-pianos-chew.loca.lt',
    'happy-nails-sneeze.loca.lt',
    'localhost:3000'
  ],
};

export default nextConfig;
