import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/news/ArticleBody';
import { ArticleMeta } from '@/components/news/ArticleMeta';
import { ShareLinks } from '@/components/news/ShareLinks';
import { JsonLd } from '@/components/seo/JsonLd';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { Twinkles, twinklePresets } from '@/components/media/Twinkles';
import { Container } from '@/components/ui/Container';
import { Display, SectionLabel } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { isLocale, locales, localePath, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { categoryName } from '@/data/news-categories';
import { getNeighbours, getPublishedBySlug, listPublishedSlugs } from '@/lib/articles/repository';
import { bodyToPlainText } from '@/lib/articles/body';
import { site } from '@/lib/site';

export async function generateStaticParams() {
  const published = await listPublishedSlugs();
  return locales.flatMap((locale) => published.map(({ slug }) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const article = await getPublishedBySlug(slug);
  if (!article) return {};

  const title = article.seoTitle || article.title;
  const description =
    article.seoDescription || article.excerpt || bodyToPlainText(article.body).slice(0, 160);
  const published = (article.publishedAt ?? article.createdAt).toISOString();
  const canonical = localePath(locale, routes.article(article.slug));

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: published,
      modifiedTime: article.updatedAt.toISOString(),
      url: canonical,
      images: article.coverImage ? [{ url: article.coverImage, alt: article.coverAlt }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

/** Articolo aperto (mockup 2e): hero 420px, colonna di lettura, tag, prev/next. */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const article = await getPublishedBySlug(slug);
  if (!article) notFound();

  const typedLocale = locale as Locale;
  const t = getDictionary(typedLocale);
  const date = article.publishedAt ?? article.createdAt;
  const { previous, next } = await getNeighbours(article);
  const url = `${site.url}${localePath(typedLocale, routes.article(article.slug))}`;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: article.title,
          description: article.seoDescription || article.excerpt,
          datePublished: date.toISOString(),
          dateModified: article.updatedAt.toISOString(),
          articleSection: categoryName(article.category),
          keywords: article.tags.join(', '),
          inLanguage: typedLocale,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          image: article.coverImage ? [`${site.url}${article.coverImage}`] : undefined,
          author: { '@type': 'Organization', name: site.legalName },
          publisher: {
            '@type': 'Organization',
            name: site.legalName,
            address: {
              '@type': 'PostalAddress',
              streetAddress: site.address.street,
              postalCode: site.address.postalCode,
              addressLocality: site.address.city,
              addressRegion: site.address.province,
              addressCountry: site.address.country,
            },
          },
        }}
      />

      {/* --- Apertura ------------------------------------------------------ */}
      <header className="relative h-280 overflow-hidden md:h-360 lg:h-420">
        <PhotoSlot
          label={article.coverAlt || `FOTO DI APERTURA ARTICOLO: ${article.title}`}
          src={article.coverImage}
          alt={article.coverAlt || article.title}
          className="absolute inset-0"
          labelPosition="top-right"
          priority
          sizes="100vw"
        />
        <div aria-hidden="true" className="veil-article absolute inset-0" />
        <Twinkles points={twinklePresets.articleHero} />
        <div className="absolute inset-x-0 bottom-46 px-24 lg:px-210">
          <ArticleMeta
            category={article.category}
            date={date}
            locale={typedLocale}
            size="hero"
            tone="gold"
            readingMinutes={article.readingMinutes}
            readingLabel={t.article.readingTime}
          />
          <Display as="h1" className="mt-16 text-28 leading-118 md:text-42">
            {article.title}
          </Display>
        </div>
      </header>

      {/* --- Corpo --------------------------------------------------------- */}
      <Container size="article" className="pt-40 lg:pt-56">
        <article>
          {article.excerpt && (
            <p className="font-body text-17 leading-170 text-ink md:text-20">
              {article.excerpt}
            </p>
          )}
          <ArticleBody blocks={article.body} className="mt-20 md:mt-26" />
        </article>

        <div className="mt-36 flex flex-wrap items-center gap-10 border-t border-hairline-strong pt-26">
          {article.tags.length > 0 && (
            <ul aria-label={t.article.tagsLabel} className="flex flex-wrap gap-10">
              {article.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-pill border border-field-border px-14 py-7 font-body text-11-5 tracking-10 text-ink-2"
                >
                  {tag.toUpperCase()}
                </li>
              ))}
            </ul>
          )}
          <ShareLinks url={url} title={article.title} />
        </div>
      </Container>

      {/* --- Continua a leggere -------------------------------------------- */}
      {(previous || next) && (
        <Container size="article" className="pt-50 pb-60 lg:pt-60 lg:pb-80">
          <SectionLabel>{t.article.keepReading}</SectionLabel>
          <div className="mt-22 grid grid-cols-1 gap-24 md:grid-cols-2">
            {previous && (
              <Link
                href={localePath(typedLocale, routes.article(previous.slug))}
                className="group/card border border-hairline bg-panel-ime px-24 py-26 md:px-28"
              >
                <p className="font-body text-10-5 tracking-16 text-ink-3">
                  <span aria-hidden="true">← </span>
                  {t.article.previous}
                </p>
                <Display
                  as="h3"
                  className="mt-10 text-19 leading-132 transition-colors duration-200 group-hover/card:text-gold md:text-21"
                >
                  {previous.title}
                </Display>
              </Link>
            )}
            {next && (
              <Link
                href={localePath(typedLocale, routes.article(next.slug))}
                className="group/card border border-hairline bg-panel-ime px-24 py-26 md:col-start-2 md:px-28 md:text-right"
              >
                <p className="font-body text-10-5 tracking-16 text-ink-3">
                  {t.article.next}
                  <span aria-hidden="true"> →</span>
                </p>
                <Display
                  as="h3"
                  className="mt-10 text-19 leading-132 transition-colors duration-200 group-hover/card:text-gold md:text-21"
                >
                  {next.title}
                </Display>
              </Link>
            )}
          </div>
        </Container>
      )}
    </>
  );
}
