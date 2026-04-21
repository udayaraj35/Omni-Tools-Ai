/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},             // Tailwind CSS
    autoprefixer: {},            // Automatically adds vendor prefixes
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}), // Minify in production
  },
};

export default config;
