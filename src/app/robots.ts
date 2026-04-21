
import { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = new URL('/sitemap.xml', 'https://omnitoolsai.fun');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/my-documents', '/login', '/admin', '/profile'],
    },
    sitemap: sitemapUrl.toString(),
  };
}
