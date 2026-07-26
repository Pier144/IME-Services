import { categoryDisplay, getNewsCategory } from '@/data/news-categories';
import { formatLongDate, formatShortDate } from '@/lib/dates';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Riga di metadati dell'articolo: categoria + data (+ tempo di lettura).
 * Un solo componente per lista, apertura e anteprima dell'editor.
 *
 * Il colore della categoria segue il mondo: blu per impianti e città,
 * rosa per La Fabbrica. In apertura d'articolo la categoria passa in oro,
 * come nel mockup 2e.
 */
export function ArticleMeta({
  category,
  date,
  locale,
  readingMinutes,
  readingLabel,
  size = 'card',
  tone = 'world',
  className,
}: {
  category: string;
  date: Date;
  locale: Locale;
  readingMinutes?: number;
  readingLabel?: string;
  size?: 'card' | 'featured' | 'hero' | 'preview';
  tone?: 'world' | 'gold';
  className?: string;
}) {
  const meta = getNewsCategory(category);

  const sizes = {
    card: 'text-10-5 tracking-16 gap-12',
    featured: 'text-11 tracking-16 gap-14',
    hero: 'text-11 tracking-18 gap-14',
    preview: 'text-10 tracking-16 gap-10',
  }[size];

  const categoryColor =
    tone === 'gold' ? 'text-gold' : meta?.tone === 'rose' ? 'text-rose' : 'text-blue-lt';

  return (
    <p className={cn('flex flex-wrap items-center font-body font-normal', sizes, className)}>
      <span className={categoryColor}>{categoryDisplay(category)}</span>
      <time dateTime={date.toISOString()} className="text-ink-3">
        {size === 'hero' ? formatLongDate(date, locale) : formatShortDate(date, locale)}
        {size === 'hero' && readingMinutes && readingLabel
          ? ` · ${readingMinutes} ${readingLabel}`
          : null}
      </time>
    </p>
  );
}
