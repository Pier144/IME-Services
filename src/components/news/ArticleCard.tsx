import Link from 'next/link';
import { ArticleMeta } from './ArticleMeta';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { ArrowText } from '@/components/ui/ArrowLink';
import { Display } from '@/components/ui/Typography';
import type { Article } from '@/lib/articles/repository';
import { localePath, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';

/** Card della griglia news (mockup 2d): foto 200px, meta, titolo 20/1.3, estratto. */
export function ArticleCard({
  article,
  locale,
  priority,
}: {
  article: Article;
  locale: Locale;
  priority?: boolean;
}) {
  const date = article.publishedAt ?? article.createdAt;

  return (
    <article>
      <Link
        href={localePath(locale, routes.article(article.slug))}
        className="group/card block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <PhotoSlot
          label={article.coverAlt || `FOTO: ${article.title}`}
          src={article.coverImage}
          alt={article.coverAlt || article.title}
          className="card-media h-180 md:h-200"
          sizes="(max-width: 900px) 100vw, 350px"
          priority={priority}
        />
        <ArticleMeta category={article.category} date={date} locale={locale} className="mt-14" />
        <Display
          as="h3"
          className="mt-9 text-18 leading-130 transition-colors duration-200 ease-out group-hover/card:text-gold md:text-20"
        >
          {article.title}
        </Display>
        {article.excerpt && (
          <p className="mt-8 font-body text-15 leading-165 font-medium text-ink-3">
            {article.excerpt}
          </p>
        )}
      </Link>
    </article>
  );
}

/** Articolo in evidenza (mockup 2d): foto 620×360 a sinistra, testo a destra. */
export function FeaturedArticle({
  article,
  locale,
  readLabel,
}: {
  article: Article;
  locale: Locale;
  readLabel: string;
}) {
  const date = article.publishedAt ?? article.createdAt;

  return (
    <article className="border border-hairline bg-panel-ime">
      <Link
        href={localePath(locale, routes.article(article.slug))}
        className="group/card flex flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:flex-row"
      >
        <PhotoSlot
          label={article.coverAlt || `FOTO ARTICOLO IN EVIDENZA: ${article.title}`}
          src={article.coverImage}
          alt={article.coverAlt || article.title}
          className="card-media h-220 flex-none md:h-300 lg:h-360 lg:w-620"
          sizes="(max-width: 1200px) 100vw, 620px"
          priority
        />
        <div className="flex flex-1 flex-col justify-center px-24 py-30 md:px-46 md:py-44">
          <ArticleMeta category={article.category} date={date} locale={locale} size="featured" />
          <Display
            as="h2"
            className="mt-16 text-24 leading-122 transition-colors duration-200 ease-out group-hover/card:text-gold md:text-32"
          >
            {article.title}
          </Display>
          {article.excerpt && (
            <p className="mt-14 font-body text-16 leading-170 text-ink-2">
              {article.excerpt}
            </p>
          )}
          <ArrowText className="mt-26">{readLabel}</ArrowText>
        </div>
      </Link>
    </article>
  );
}
