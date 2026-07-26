import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Il link testuale oro con la freccia: 12.5px, peso 500, letter-spacing .14em.
 * La freccia è un carattere, non un'icona (nel design le icone non esistono).
 */
export function ArrowLink({
  href,
  children,
  className,
  size = 'md',
  direction = 'forward',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
  direction?: 'forward' | 'back';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group/arrow inline-flex items-center gap-8 font-body font-medium tracking-14 text-gold',
        'transition-colors duration-200 ease-out hover:text-gold-hover',
        size === 'sm' ? 'text-12' : 'text-12-5',
        className,
      )}
    >
      {direction === 'back' && <span aria-hidden="true">←</span>}
      {children}
      {direction === 'forward' && <span aria-hidden="true">→</span>}
    </Link>
  );
}

/** La stessa resa, ma dentro una card già cliccabile (quindi non è un <a>). */
export function ArrowText({
  children,
  className,
  size = 'md',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-8 font-body font-medium tracking-14 text-gold',
        size === 'sm' ? 'text-12' : 'text-12-5',
        className,
      )}
    >
      {children}
      <span aria-hidden="true">→</span>
    </span>
  );
}
