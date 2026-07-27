import { PhotoSlot } from '@/components/media/PhotoSlot';
import type { BodyBlock } from '@/lib/articles/body';
import { renderInline } from '@/lib/articles/inline';
import { cn } from '@/lib/utils';

/**
 * Renderer del corpo dell'articolo.
 *
 * È lo stesso componente usato dalla pagina pubblica (mockup 2e) e
 * dall'anteprima live dell'editor (mockup 2j): cambia solo `scale`, che
 * rimpicciolisce i corpi tipografici. Non esiste un secondo markup da tenere
 * allineato, quindi quello che il redattore vede in anteprima è davvero quello
 * che finisce online.
 */

type Scale = 'article' | 'preview';

const styles = {
  article: {
    lead: 'font-body text-17 leading-165 text-ink md:text-20',
    paragraph: 'mt-20 font-body text-16 leading-185 text-ink-2 md:text-17 md:mt-26',
    heading: 'mt-40 font-display text-24 font-medium md:text-28',
    quote: 'my-34 border-l-2 border-gold py-6 pl-26 font-display text-20 leading-150 font-medium text-white md:text-24',
    quoteAttribution: 'mt-14 font-body text-12 font-normal tracking-18 text-ink-3',
    list: 'mt-20 flex flex-col gap-10 font-body text-16 leading-170 text-ink-2 md:text-17',
    image: 'h-220 md:h-340',
    caption: 'mt-10 font-body text-13 text-ink-3',
  },
  preview: {
    lead: 'font-body text-14 leading-170 font-medium text-ink-2',
    paragraph: 'mt-12 font-body text-13-5 leading-180 font-medium text-ink-3',
    heading: 'mt-18 font-display text-16 font-medium text-ink',
    quote: 'my-16 border-l-2 border-gold py-4 pl-14 font-display text-14 leading-150 font-medium text-white',
    quoteAttribution: 'mt-8 font-body text-10-5 font-normal tracking-18 text-ink-3',
    list: 'mt-12 flex flex-col gap-6 font-body text-13-5 leading-170 font-medium text-ink-3',
    image: 'h-110',
    caption: 'mt-6 font-body text-10-5 text-ink-3',
  },
} as const;

export function ArticleBody({
  blocks,
  scale = 'article',
  className,
}: {
  blocks: readonly BodyBlock[];
  scale?: Scale;
  className?: string;
}) {
  const s = styles[scale];

  return (
    <div className={cn('prose-article', className)}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case 'lead':
            return (
              <p key={key} className={s.lead}>
                {renderInline(block.text)}
              </p>
            );

          case 'paragraph':
            return (
              <p key={key} className={s.paragraph}>
                {renderInline(block.text)}
              </p>
            );

          case 'heading':
            return (
              <h2 key={key} className={s.heading}>
                {block.text}
              </h2>
            );

          case 'quote':
            return (
              <blockquote key={key} className={s.quote}>
                <p>«{block.text}»</p>
                {block.attribution && (
                  <footer className={`flex items-center gap-10 ${s.quoteAttribution}`}>
                    {/* Il filetto che introduce l'attribuzione è disegnato, non
                        scritto: nel testo del sito non compaiono trattini lunghi. */}
                    <span aria-hidden="true" className="block h-1 w-16 flex-none bg-current" />
                    {block.attribution.toUpperCase()}
                  </footer>
                )}
              </blockquote>
            );

          case 'list':
            return (
              <ul key={key} className={s.list}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-baseline gap-12">
                    {/* Trattino disegnato, non scritto: stesso segno di prima
                        senza il carattere. */}
                    <span
                      aria-hidden="true"
                      className="relative -top-4 block h-1 w-12 flex-none bg-gold"
                    />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );

          case 'image':
            return (
              <figure key={key} className={scale === 'article' ? 'mt-26' : 'mt-14'}>
                <PhotoSlot
                  label={block.label}
                  src={block.src}
                  alt={block.caption ?? block.label}
                  className={s.image}
                  sizes={scale === 'article' ? '(max-width: 1200px) 100vw, 780px' : '380px'}
                />
                {block.caption && <figcaption className={s.caption}>{block.caption}</figcaption>}
              </figure>
            );
        }
      })}
    </div>
  );
}
