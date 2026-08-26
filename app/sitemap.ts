import { MetadataRoute } from 'next';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/trains', '/stations', '/journeys'];
  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
