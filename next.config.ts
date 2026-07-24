import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {

    remotePatterns: [

      // Supabase hosted storage (production)

      {

        protocol: 'https',

        hostname: '*.supabase.co',

        pathname: '/storage/v1/**',

      },

      // Supabase India/other regions

      {

        protocol: 'https',

        hostname: '*.supabase.in',

        pathname: '/storage/v1/**',

      },

      // Local Supabase dev (http://127.0.0.1:54321 or localhost:54321)

      {

        protocol: 'http',

        hostname: '127.0.0.1',

        port: '54321',

        pathname: '/storage/v1/**',

      },

      {

        protocol: 'http',

        hostname: 'localhost',

        port: '54321',

        pathname: '/storage/v1/**',

      },

    ],

  },

};


 

export default nextConfig;