import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // L'area riservata, le API e gli allegati non vanno indicizzati.
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
