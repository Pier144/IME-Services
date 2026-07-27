'use client';

import { ArticleBody } from '@/components/news/ArticleBody';
import { ArticleMeta } from '@/components/news/ArticleMeta';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { Display } from '@/components/ui/Typography';
import { useI18n } from '@/i18n/provider';
import type { BodyBlock } from '@/lib/articles/body';
import { cn } from '@/lib/utils';

/**
 * Anteprima live dell'editor (mockup 2j).
 *
 * Usa gli stessi componenti della pagina pubblica (`ArticleMeta`,
 * `ArticleBody`, `PhotoSlot`, `Display`) con la sola `scale="preview"` a
 * rimpicciolire i corpi. Non c'è un secondo markup: quello che si vede qui è
 * quello che finisce online.
 */
export function ArticlePreview({
  title,
  excerpt,
  category,
  coverImage,
  coverAlt,
  date,
  blocks,
  device,
  placeholderTitle,
}: {
  title: string;
  excerpt: string;
  category: string;
  coverImage: string | null;
  coverAlt: string;
  date: Date;
  blocks: BodyBlock[];
  device: 'desktop' | 'mobile';
  placeholderTitle: string;
}) {
  const { locale } = useI18n();

  return (
    <div
      className={cn(
        'border border-hairline-strong bg-night',
        device === 'mobile' && 'mx-auto w-320',
      )}
    >
      <PhotoSlot
        label={coverAlt || 'copertina'}
        src={coverImage}
        alt={coverAlt || title}
        className="h-150"
        labelClassName="text-9"
        sizes="430px"
      />
      <div className="px-20 py-20">
        {category && (
          <ArticleMeta category={category} date={date} locale={locale} size="preview" tone="gold" />
        )}
        <Display as="h2" className="mt-10 text-22 leading-128">
          {title || placeholderTitle}
        </Display>
        {excerpt && (
          <p className="mt-10 font-body text-14 leading-170 font-medium text-ink-2">{excerpt}</p>
        )}
        <ArticleBody blocks={blocks} scale="preview" className="mt-12" />
      </div>
    </div>
  );
}
