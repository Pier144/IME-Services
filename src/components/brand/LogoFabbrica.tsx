import { cn } from '@/lib/utils';

/**
 * Wordmark "La Fabbrica di Babbo Natale" in Satisfy.
 * Anche questo è una ricostruzione tipografica: all'arrivo dell'SVG ufficiale
 * si tocca solo questo file.
 */
export function LogoFabbrica({
  className,
  as: Tag = 'span',
}: {
  className?: string;
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'em';
}) {
  return (
    <Tag className={cn('font-script font-normal not-italic text-rose-lt', className)}>
      La Fabbrica di Babbo Natale
    </Tag>
  );
}
