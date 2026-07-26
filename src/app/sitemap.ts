import type { MetadataRoute } from 'next';
import { locales, localePath } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { subjects } from '@/data/subjects';
import { listPublishedSlugs } from '@/lib/articles/repository';
import { site } from '@/lib/site';

const STATIC_PAGES = [
  { path: routes.home, priority: 1, changeFrequency: 'monthly' as const },
  { path: routes.luminarie, priority: 0.9, changeFrequency: 'monthly' as const },
  { path: routes.custom, priority: 0.9, changeFrequency: 'monthly' as const },
  { path: routes.impianti, priority: 0.8, changeFrequency: 'monthly' as const },
  { path: routes.about, priority: 0.7, changeFrequency: 'yearly' as const },
  { path: routes.news, priority: 0.7, changeFrequency: 'weekly' as const },
  { path: routes.careers, priority: 0.6, changeFrequency: 'monthly' as const },
  { path: routes.privacy, priority: 0.2, changeFrequency: 'yearly' as const },
];

/**
 * Sitemap con le due lingue. Ogni voce dichiara l'alternativa nell'altra lingua
 * (`alternates.languages`), così i motori capiscono che sono la stessa pagina.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listPublishedSlugs();
  const now = new Date();

  const entry = (path: string, lastModified: Date, priority: number, changeFrequency: 'yearly' | 'monthly' | 'weekly' | 'daily') =>
    locales.map((locale) => ({
      url: `${site.url}${localePath(locale, path)}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((other) => [other, `${site.url}${localePath(other, path)}`]),
        ),
      },
    }));

  return [
    ...STATIC_PAGES.flatMap((page) =>
      entry(page.path, now, page.priority, page.changeFrequency),
    ),
    ...subjects.flatMap((subject) => entry(routes.subject(subject.slug), now, 0.6, 'monthly')),
    ...articles.flatMap((article) =>
      entry(routes.article(article.slug), article.updatedAt, 0.5, 'yearly'),
    ),
  ];
}
