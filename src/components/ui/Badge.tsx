import { cn } from '@/lib/utils';

/**
 * Badge di stato dell'area riservata.
 * BOZZA      → bordo oro + testo oro
 * PUBBLICATO → fondo `blue-chip-bg` + testo `blue-chip-tx`
 */
export function StatusBadge({
  status,
  label,
  className,
}: {
  status: 'draft' | 'published';
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-10 py-4 font-body text-11 tracking-08',
        status === 'draft'
          ? 'border border-gold text-gold'
          : 'bg-blue-chip-bg text-blue-chip-tx',
        className,
      )}
    >
      {label}
    </span>
  );
}
