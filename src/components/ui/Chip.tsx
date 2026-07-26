import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Chip di filtro: pill 999px, 12.5px.
 * Attiva = fondo oro su testo `gold-ink`; a riposo = bordo `field-border`.
 * Sono link veri (lo stato vive in querystring) così i filtri sono condivisibili
 * e funzionano anche senza JavaScript.
 */
export function ChipLink({
  href,
  active,
  children,
  className,
  scroll = false,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={scroll}
      aria-current={active ? 'true' : undefined}
      className={cn(chipClasses(active), className)}
    >
      {children}
    </Link>
  );
}

export function chipClasses(active?: boolean) {
  return cn(
    'inline-flex items-center rounded-pill px-16 py-8 font-body text-12-5 font-normal',
    'transition-colors duration-200 ease-out',
    active
      ? 'bg-gold text-gold-ink'
      : 'border border-field-border text-ink-2 hover:border-gold hover:text-gold',
  );
}

/** Pill statica (tag di un articolo, soggetti in richiesta). */
export function Tag({
  children,
  className,
  onRemove,
  removeLabel,
}: {
  children: React.ReactNode;
  className?: string;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-8 rounded-pill border border-field-border px-14 py-7',
        'font-body text-11-5 font-normal tracking-10 text-ink-2',
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="text-ink-3 transition-colors duration-200 hover:text-red"
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </span>
  );
}
