
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent node-specific modules from being bundled on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: false,
        path: false,
        crypto: false,
        fs: false,
        os: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
  async redirects() {
    return [
      {
        // Correct the wrong admin login path often probed by bots
        source: '/login/admin',
        destination: '/admin/login',
        permanent: false,
      },
      {
        // Redirect common vulnerability probes for admin panels and APIs
        source: '/(secure|backoffice|management|private|internal|console|panel|settings|account|api/config|api/me)/:path*',
        destination: '/',
        permanent: true,
      },
      {
        // Redirect other common file probes
        source: '/(.well-known/ucp|meta.json|favicon.ico)',
        destination: '/',
        permanent: true,
      },
      {
        // Block probes for WordPress files
        source: '/(wp-admin|wordpress|wp-login.php|wp-content|wp-includes)/:path*',
        destination: '/',
        permanent: true,
      },
      {
        // Block probes for environment files
        source: '/:file(\\.env.*)',
        destination: '/',
        permanent: true,
      },
      {
        // Block probes for common secret/credential filenames
        source: '/:filename(secrets|credentials|aws|stripe|s3|serverless|cloudformation|terraform).:ext(json|yml|yaml|txt|bak|old|key|secret|log|ini|conf|save|tf|tfstate)',
        destination: '/',
        permanent: true,
      },
      {
        // Block probes for common secret directories
        source: '/:dirname(\\.aws|\\.git|\\.github|\\.gitlab|\\.circleci|\\.terraform)/:slug*',
        destination: '/',
        permanent: true,
      },
       {
        // Block probes for other common config directories
        source: '/(config|storage|helpers|git)/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/(.well-known/)?apple-app-site-association',
        destination: '/',
        permanent: true,
      },
      {
        // Block common PHP file probes
        source: '/:path*.php',
        destination: '/',
        permanent: true,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
      serverActionsTimeout: 120, // Increase timeout to 2 minutes
    },
    cpus: 1,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'esewa.com.np',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gibl-assets.gibl.com.np',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.paypalobjects.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'web.khalti.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.buymeacoffee.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hpanel.hostinger.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thumbs.dreamstime.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.stockcake.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.etsystatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn11.bigcommerce.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.exoticindia.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'enlightenmentthangka.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.exoticindiaart.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
