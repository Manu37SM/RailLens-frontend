import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Kept in sync with the per-page robots:{index:false} metadata on
      // these routes (login/register/history/favorites/assistant/admin) -
      // listed here too so crawlers that don't render JS/read <meta> tags
      // still know not to bother crawling them.
      disallow: ['/login', '/register', '/history', '/favorites', '/assistant', '/admin'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
