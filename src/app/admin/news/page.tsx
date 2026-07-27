import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ArticleSearch } from '@/components/admin/ArticleSearch';
import { DeleteArticleButton } from '@/components/admin/DeleteArticleButton';
import { NewArticleButton } from '@/components/admin/NewArticleButton';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { StatusBadge } from '@/components/ui/Badge';
import { Display } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { defaultLocale } from '@/i18n/config';
import { adminRoutes } from '@/lib/routes';
import { requireSession } from '@/lib/auth';
import { countByStatus, listForAdmin, type ArticleStatus } from '@/lib/articles/repository';
import { categoryName } from '@/data/news-categories';
import { formatNumericDate } from '@/lib/dates';
import { firstParam, paginate, cn } from '@/lib/utils';

const PER_PAGE = 6;
const COLUMNS = 'grid-cols-[70px_1fr_150px_120px_110px_130px]';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Area riservata · lista articoli (mockup 2i). */
export default async function AdminNewsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession();
  const t = getDictionary(defaultLocale);
  const query = await searchParams;

  const search = firstParam(query.q)?.trim() ?? '';
  const statusParam = firstParam(query.stato);
  const status: ArticleStatus | 'all' =
    statusParam === 'published' || statusParam === 'draft' ? statusParam : 'all';
  const requestedPage = Number(firstParam(query.pagina) ?? '1');

  const [counts, articles] = await Promise.all([
    countByStatus(),
    listForAdmin({ query: search || undefined, status }),
  ]);

  const page = paginate(articles, Number.isFinite(requestedPage) ? requestedPage : 1, PER_PAGE);

  const hrefFor = (nextStatus: ArticleStatus | 'all', nextPage = 1) => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (nextStatus !== 'all') params.set('stato', nextStatus);
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
      <AdminSidebar email={session.email} />

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
            <ArticleSearch initialQuery={search} status={status} />
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

        {/* --- Intestazione tabella (solo da 900px in su) -------------------- */}
        <div
          className={cn(
            'hidden items-center border-b border-hairline py-14 font-body text-10-5 font-medium tracking-16 text-ink-4 md:grid',
            COLUMNS,
          )}
        >
          <span />
          <span>{t.admin.news.columns.title}</span>
          <span>{t.admin.news.columns.category}</span>
          <span>{t.admin.news.columns.date}</span>
          <span>{t.admin.news.columns.status}</span>
          <span className="text-right">{t.admin.news.columns.actions}</span>
        </div>

        {page.items.length === 0 ? (
          <p className="border-b border-hairline py-40 text-center font-body text-15 font-medium text-ink-3">
            {counts.total === 0 ? t.admin.news.emptyAll : t.admin.news.empty}
          </p>
        ) : (
          <ul>
            {page.items.map((article) => (
              <li
                key={article.id}
                className={cn(
                  'flex flex-col gap-10 border-b border-hairline-soft py-16 font-body text-15 font-medium text-ink-2',
                  'md:grid md:items-center md:gap-0 md:py-13',
                  COLUMNS,
                )}
              >
                <PhotoSlot
                  label="img"
                  src={article.coverImage}
                  alt=""
                  className="h-38 w-54"
                  labelClassName="text-8 px-4 py-2"
                  sizes="54px"
                />

                <Link
                  href={adminRoutes.article(article.id)}
                  className="pr-20 text-ink transition-colors duration-200 hover:text-gold"
                >
                  {article.title || t.admin.editor.newArticle}
                </Link>

                <span className="text-ink-3">
                  <span className="md:hidden">{t.admin.news.columns.category}: </span>
                  {article.category ? categoryName(article.category) : '·'}
                </span>

                <span className="text-ink-3">
                  <span className="md:hidden">{t.admin.news.columns.date}: </span>
                  {article.publishedAt ? formatNumericDate(article.publishedAt) : '·'}
                </span>

                <span>
                  <StatusBadge
                    status={article.status}
                    label={
                      article.status === 'draft'
                        ? t.admin.news.status.draft
                        : t.admin.news.status.published
                    }
                  />
                </span>

                <span className="flex items-center gap-8 text-12-5 tracking-06 md:justify-end">
                  <Link
                    href={adminRoutes.article(article.id)}
                    className="text-gold transition-colors duration-200 hover:text-gold-hover"
                  >
                    {t.admin.news.edit}
                  </Link>
                  <span aria-hidden="true" className="text-ink-4">
                    ·
                  </span>
                  <DeleteArticleButton
                    id={article.id}
                    title={article.title || t.admin.editor.newArticle}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* --- Piede --------------------------------------------------------- */}
        <div className="mt-22 flex flex-wrap items-center justify-between gap-14 font-body text-13 font-medium text-ink-3">
          <span>
            {page.from}-{page.to} {t.admin.news.results} {page.total}
          </span>
          {page.totalPages > 1 && (
            <div className="flex gap-7">
              {Array.from({ length: page.totalPages }, (_, index) => index + 1).map((value) => (
                <Link
                  key={value}
                  href={hrefFor(status, value)}
                  aria-current={value === page.page ? 'page' : undefined}
                  className={cn(
                    'flex size-32 items-center justify-center transition-colors duration-200 ease-out',
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
