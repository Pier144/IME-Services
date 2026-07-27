import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Paginazione a quadrati: 38px sul sito pubblico, 32px nell'area riservata.
 * La pagina corrente è oro su `gold-ink`, le altre hanno il bordo `field-border`.
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  label,
  nextLabel,
  prevLabel,
  size = 'public',
  className,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  label: string;
  nextLabel?: string;
  prevLabel?: string;
  size?: 'public' | 'admin';
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const box =
    size === 'admin'
      ? 'size-32 text-13 font-medium'
      : 'size-38 text-13 font-normal';

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label={label} className={cn('flex items-center justify-center gap-8', className)}>
      {prevLabel && page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          className={cn(
            'flex h-38 items-center justify-center border border-field-border px-18',
            'font-body text-13 tracking-10 text-ink-2',
            'transition-colors duration-200 ease-out hover:border-gold hover:text-gold',
          )}
        >
          ← {prevLabel}
        </Link>
      )}

      {pages.map((value) => {
        const current = value === page;
        return (
          <Link
            key={value}
            href={hrefFor(value)}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'flex items-center justify-center font-body transition-colors duration-200 ease-out',
              box,
              current
                ? 'bg-gold text-gold-ink'
                : 'border border-field-border text-ink-2 hover:border-gold hover:text-gold',
            )}
          >
            {value}
          </Link>
        );
      })}

      {nextLabel && page < totalPages && (
        <Link
          href={hrefFor(page + 1)}
          className={cn(
            'flex h-38 items-center justify-center border border-field-border px-18',
            'font-body text-13 tracking-10 text-ink-2',
            'transition-colors duration-200 ease-out hover:border-gold hover:text-gold',
          )}
        >
          {nextLabel} →
        </Link>
      )}
    </nav>
  );
}
