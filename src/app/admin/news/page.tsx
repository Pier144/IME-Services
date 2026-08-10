import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ArticleList } from '@/components/admin/ArticleList';
import { ArticleSearch } from '@/components/admin/ArticleSearch';
import { NewArticleButton } from '@/components/admin/NewArticleButton';
import { PerPageSelect } from '@/components/admin/PerPageSelect';
import { Display } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { defaultLocale } from '@/i18n/config';
import { adminRoutes } from '@/lib/routes';
import { requireSession } from '@/lib/auth';
import {
  countByStatus,
  listForAdmin,
  publishedYears,
  type ArticleStatus,
} from '@/lib/articles/repository';
import { newsCategories } from '@/data/news-categories';
import { firstParam, paginate, cn } from '@/lib/utils';

const PER_PAGE_OPTIONS = [8, 16, 32];
const PER_PAGE_DEFAULT = 8;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Area riservata · lista articoli (handoff 6a).
 *
 * Resta un componente server: interroga il database e costruisce gli
 * indirizzi. Le righe e la selezione multipla vivono in `ArticleList`, che è
 * client perché la selezione è stato dell'interfaccia.
 */
export default async function AdminNewsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession();
  const t = getDictionary(defaultLocale);
  const query = await searchParams;

  const search = firstParam(query.q)?.trim() ?? '';
  const statusParam = firstParam(query.stato);
  const status: ArticleStatus | 'all' =
    statusParam === 'published' || statusParam === 'draft' ? statusParam : 'all';
  const category = firstParam(query.categoria)?.trim() ?? '';
  const yearParam = firstParam(query.anno)?.trim() ?? '';
  const year = /^\d{4}$/.test(yearParam) ? Number(yearParam) : undefined;

  const perPageParam = Number(firstParam(query.perPagina) ?? PER_PAGE_DEFAULT);
  const perPage = PER_PAGE_OPTIONS.includes(perPageParam) ? perPageParam : PER_PAGE_DEFAULT;
  const requestedPage = Number(firstParam(query.pagina) ?? '1');

  const [counts, articles, years] = await Promise.all([
    countByStatus(),
    listForAdmin({ query: search || undefined, status, category: category || undefined, year }),
    publishedYears(),
  ]);

  const page = paginate(articles, Number.isFinite(requestedPage) ? requestedPage : 1, perPage);

  /** Un solo posto costruisce gli indirizzi: nessun filtro si perde cambiando scheda. */
  const hrefFor = (nextStatus: ArticleStatus | 'all', nextPage = 1) => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (nextStatus !== 'all') params.set('stato', nextStatus);
    if (category) params.set('categoria', category);
    if (yearParam) params.set('anno', yearParam);
    if (perPage !== PER_PAGE_DEFAULT) params.set('perPagina', String(perPage));
    if (nextPage > 1) params.set('pagina', String(nextPage));
    const suffix = params.toString();
    return suffix ? `${adminRoutes.news}?${suffix}` : adminRoutes.news;
  };

  const tabs = [
    { key: 'all' as const, label: t.admin.news.tabs.all, count: counts.total, href: hrefFor('all') },
    {
      key: 'published' as const,
      label: t.admin.news.tabs.published,
      count: counts.published,
      href: hrefFor('published'),
    },
    {
      key: 'draft' as const,
      label: t.admin.news.tabs.drafts,
      count: counts.drafts,
      href: hrefFor('draft'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar email={session.email} articleCount={counts.total} />

      <main className="min-w-0 flex-1 px-24 py-24 lg:px-34 lg:py-30">
        <div className="flex flex-col gap-16 md:flex-row md:items-end md:justify-between">
          <div>
            <Display as="h1" className="text-26 md:text-30">
              {t.admin.news.title}
            </Display>
            <p className="mt-5 font-body text-13-5 font-medium text-ink-3">
              {counts.total} {counts.total === 1 ? t.admin.news.countArticle : t.admin.news.countArticles}
              {counts.drafts > 0 && (
                <>
                  {' · '}
                  {counts.drafts} {counts.drafts === 1 ? t.admin.news.countDraft : t.admin.news.countDrafts}
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-12">
            <ArticleSearch
              filters={{ query: search, status, category, year: yearParam }}
              categories={newsCategories.map((c) => ({ slug: c.slug, name: c.name }))}
              years={years}
            />
            <NewArticleButton />
          </div>
        </div>

        <ArticleList
          articles={page.items.map((article) => ({
            id: article.id,
            title: article.title,
            category: article.category,
            publishedAt: article.publishedAt,
            status: article.status,
            featured: article.featured,
            coverImage: article.coverImage,
          }))}
          tabs={tabs}
          activeTab={status}
          categories={newsCategories.map((c) => ({ slug: c.slug, name: c.name }))}
          emptyLabel={counts.total === 0 ? t.admin.news.emptyAll : t.admin.news.empty}
        />

        {/* --- Piede --------------------------------------------------------- */}
        <div className="mt-22 flex flex-wrap items-center justify-between gap-14 font-body text-13 font-medium text-ink-3">
          <span className="flex items-center gap-12">
            <span>
              {page.from}-{page.to} {t.admin.news.results} {page.total}
            </span>
            <span aria-hidden="true" className="text-ink-4">
              ·
            </span>
            <PerPageSelect value={perPage} options={PER_PAGE_OPTIONS} />
          </span>

          {page.totalPages > 1 && (
            <div className="flex gap-7">
              {Array.from({ length: page.totalPages }, (_, index) => index + 1).map((value) => (
                <Link
                  key={value}
                  href={hrefFor(status, value)}
                  aria-current={value === page.page ? 'page' : undefined}
                  className={cn(
                    'flex size-32 items-center justify-center transition-colors duration-200',
                    value === page.page
                      ? 'bg-gold text-gold-ink'
                      : 'border border-field-border text-ink-2 hover:border-gold hover:text-gold',
                  )}
                >
                  {value}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
