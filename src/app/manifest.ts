import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OmniTools AI',
    short_name: 'OmniTools',
    description: '100+ Free AI tools for CV building, 8K photo upscale, video generation, background removal, and more. Your all-in-one AI suite for creative and professional tasks.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A192F',
    theme_color: '#0A192F',
    icons: [
      {
        src: 'https://i.imgur.com/QZssMZW.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://i.imgur.com/QZssMZW.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
