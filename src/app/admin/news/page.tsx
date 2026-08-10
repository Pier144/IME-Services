import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ArticleSearch } from '@/components/admin/ArticleSearch';
import { DeleteArticleButton } from '@/components/admin/DeleteArticleButton';
import { NewArticleButton } from '@/components/admin/NewArticleButton';
import { PerPageSelect } from '@/components/admin/PerPageSelect';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { ArticleMeta } from '@/components/news/ArticleMeta';
import { StatusBadge } from '@/components/ui/Badge';
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

/** Area riservata · lista articoli a righe (handoff 6a). */
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
    { key: 'all' as const, label: t.admin.news.tabs.all, count: counts.total },
    { key: 'published' as const, label: t.admin.news.tabs.published, count: counts.published },
    { key: 'draft' as const, label: t.admin.news.tabs.drafts, count: counts.drafts },
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

        {/* --- Tab di stato ------------------------------------------------- */}
        <nav className="mt-26 flex gap-26 overflow-x-auto border-b border-hairline-strong font-body text-13 tracking-10">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={hrefFor(tab.key)}
              aria-current={status === tab.key ? 'page' : undefined}
              className={cn(
                'flex-none pb-12 whitespace-nowrap transition-colors duration-200 ease-out',
                status === tab.key ? 'text-gold shadow-tab-active' : 'text-ink-3 hover:text-gold',
              )}
            >
              {tab.label} ({tab.count})
            </Link>
          ))}
        </nav>

        {page.items.length === 0 ? (
          <p className="border-b border-hairline py-40 text-center font-body text-15 font-medium text-ink-3">
            {counts.total === 0 ? t.admin.news.emptyAll : t.admin.news.empty}
          </p>
        ) : (
          <ul>
            {page.items.map((article) => (
              <li
                key={article.id}
                className="group flex items-center gap-20 border-b border-hairline-soft py-16 transition-colors duration-200 hover:bg-white/2"
              >
                <PhotoSlot
                  label="img"
                  src={article.coverImage}
                  alt=""
                  className="h-58 w-88 flex-none"
                  labelClassName="text-8 px-4 py-2"
                  sizes="88px"
                />

                <span className="min-w-0 flex-1">
                  <Link
                    href={adminRoutes.article(article.id)}
                    className="block font-body text-17 font-medium text-ink transition-colors duration-200 hover:text-gold"
                  >
                    {article.title || t.admin.editor.newArticle}
                  </Link>
                  <ArticleMeta
                    category={article.category}
                    date={article.publishedAt}
                    noDateLabel={t.admin.news.noDate}
                    featuredLabel={article.featured ? t.admin.news.featured : undefined}
                    locale={defaultLocale}
                    size="admin"
                    className="mt-6"
                  />
                </span>

                <StatusBadge
                  status={article.status}
                  label={
                    article.status === 'draft'
                      ? t.admin.news.status.draft
                      : t.admin.news.status.published
                  }
                />

                <span className="flex w-110 flex-none items-center justify-end gap-8 font-body text-12-5 tracking-06">
                  <Link
                    href={adminRoutes.article(article.id)}
                    className="text-gold transition-colors duration-200 hover:text-gold-hover"
                  >
                    {t.admin.news.edit}
                  </Link>
                  {/* «Elimina» a riposo non si vede: è l'unica azione irreversibile
                      della riga e non deve stare sotto il dito per sbaglio. */}
                  <span className="flex items-center gap-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    <span aria-hidden="true" className="text-ink-4">
                      ·
                    </span>
                    <DeleteArticleButton
                      id={article.id}
                      title={article.title || t.admin.editor.newArticle}
                    />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

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
