import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Static routes only for now. Deliberately NOT pulling in every individual
 * /trains/[trainNumber] and /stations/[stationCode] page here - the
 * backend's list endpoints are paginated (see Enhancement 7) with no
 * "give me every train/station code" mode, so generating those thousands
 * of entries would mean either bypassing pagination with a huge page size
 * (defeats the point of pagination existing) or paging through the whole
 * dataset on every sitemap request. If train/station page SEO becomes a
 * priority, the right fix is a small dedicated backend endpoint that
 * returns just codes/numbers (no full DTOs) for sitemap generation, not
 * reusing the search endpoints for it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/trains', '/stations', '/journeys'];

  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
