import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleCard, FeaturedArticle } from '@/components/news/ArticleCard';
import { ChipLink } from '@/components/ui/Chip';
import { Container } from '@/components/ui/Container';
import { Pagination } from '@/components/ui/Pagination';
import { Display, Eyebrow } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { isLocale, localePath, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { newsCategories } from '@/data/news-categories';
import { getFeatured, listPublished } from '@/lib/articles/repository';
import { firstParam, paginate } from '@/lib/utils';

const PER_PAGE = 6;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    // Il nome dell'azienda è già nel titolo: niente suffisso automatico.
    title: { absolute: t.news.metaTitle },
    description: t.news.metaDescription,
    alternates: { canonical: localePath(locale, routes.news) },
    openGraph: { title: t.news.metaTitle, description: t.news.metaDescription },
  };
}

/**
 * News (mockup 2d): articolo in evidenza, griglia a tre colonne, paginazione.
 * Categoria e pagina stanno in querystring.
 */
export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const t = getDictionary(typedLocale);
  const query = await searchParams;

  const categoryParam = firstParam(query.categoria);
  const category = newsCategories.some((item) => item.slug === categoryParam)
    ? categoryParam
    : undefined;
  const requestedPage = Number(firstParam(query.pagina) ?? '1');

  const [featured, all] = await Promise.all([
    getFeatured(category),
    listPublished({ category }),
  ]);

  // L'articolo in evidenza sta sopra: nella griglia non si ripete.
  const rest = featured ? all.filter((article) => article.id !== featured.id) : all;
  const page = paginate(rest, Number.isFinite(requestedPage) ? requestedPage : 1, PER_PAGE);

  const base = localePath(typedLocale, routes.news);
  const hrefFor = (nextPage: number, nextCategory = category) => {
    const search = new URLSearchParams();
    if (nextCategory) search.set('categoria', nextCategory);
    if (nextPage > 1) search.set('pagina', String(nextPage));
    const suffix = search.toString();
    return suffix ? `${base}?${suffix}` : base;
  };

  return (
    <>
      {/* --- Intestazione + filtri ---------------------------------------- */}
      <Container className="flex flex-col gap-24 pt-44 lg:flex-row lg:items-end lg:justify-between lg:pt-64">
        <div>
          <Eyebrow tone="gold" size="md" tracking="34">
            {t.news.eyebrow}
          </Eyebrow>
          <Display as="h1" className="mt-14 text-32 leading-110 md:text-46">
            {t.news.title}
          </Display>
          <p className="mt-10 max-w-520 font-body text-16 leading-160 font-light text-ink-2">
            {t.news.intro}
          </p>
        </div>

        <div
          role="group"
          aria-label={t.news.filtersLabel}
          className="flex flex-wrap gap-9 font-body"
        >
          <ChipLink href={base} active={!category}>
            {t.news.allCategories}
          </ChipLink>
          {newsCategories.map((item) => (
            <ChipLink
              key={item.slug}
              href={hrefFor(1, item.slug)}
              active={category === item.slug}
            >
              {item.name}
            </ChipLink>
          ))}
        </div>
      </Container>

      {/* --- Articolo in evidenza ----------------------------------------- */}
      {featured && (
        <Container className="pt-38">
          <FeaturedArticle article={featured} locale={typedLocale} readLabel={t.news.read} />
        </Container>
      )}

      {/* --- Griglia ------------------------------------------------------- */}
      <Container className="pt-34 pb-20">
        {page.items.length === 0 && !featured ? (
          <p className="border border-hairline bg-panel-ime px-24 py-40 text-center font-body text-15 font-light text-ink-3">
            {t.news.empty}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-24 gap-y-34 sm:grid-cols-2 lg:grid-cols-3">
            {page.items.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                locale={typedLocale}
                priority={index < 3}
              />
            ))}
          </div>
        )}
      </Container>

      <Container className="pt-20 pb-50 lg:pb-70">
        <Pagination
          page={page.page}
          totalPages={page.totalPages}
          hrefFor={(value) => hrefFor(value)}
          label={t.news.paginationLabel}
          nextLabel={t.news.next}
          prevLabel={t.news.prev}
        />
      </Container>
    </>
  );
}
