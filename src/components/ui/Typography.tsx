import { cn } from '@/lib/utils';

/**
 * Etichetta di sezione: 12px, letter-spacing .22em, testo secondario.
 * È il ritmo che separa i blocchi in tutte le pagine.
 */
export function SectionLabel({
  children,
  className,
  tone = 'muted',
  as: Tag = 'h2',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'muted' | 'gold';
  as?: 'h2' | 'h3' | 'div' | 'p';
}) {
  return (
    <Tag
      className={cn(
        'font-body text-12 font-medium tracking-22',
        tone === 'gold' ? 'text-gold' : 'text-ink-3',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Occhiello: la riga in maiuscoletto sopra i titoli degli hero.
 * `tracking` segue la gerarchia del mockup, compressa: il tetto è .22em invece
 * di .34em (hero .20em, breadcrumb e card .18em, meta articolo .16em). Le
 * maiuscole troppo distanziate erano gran parte della sensazione "tecnica"
 * lamentata; sopra .22em non si torna, e infatti l'unione non li accetta più.
 */
export function Eyebrow({
  children,
  className,
  tone = 'gold',
  size = 'md',
  tracking = '20',
  as: Tag = 'p',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'gold' | 'muted' | 'blue' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  tracking?: '16' | '18' | '20' | '22';
  as?: 'p' | 'div' | 'span' | 'h2';
}) {
  const tones = {
    gold: 'text-gold',
    muted: 'text-ink-3',
    blue: 'text-blue-lt',
    rose: 'text-rose',
  } as const;
  const sizes = { sm: 'text-11-5', md: 'text-12', lg: 'text-12-5' } as const;
  const trackings = {
    '16': 'tracking-16',
    '18': 'tracking-18',
    '20': 'tracking-20',
    '22': 'tracking-22',
  } as const;

  return (
    <Tag
      className={cn('font-body font-medium', sizes[size], trackings[tracking], tones[tone], className)}
    >
      {children}
    </Tag>
  );
}

/** Titolo display: Archivo 500, a capo "pretty", mai maiuscolo forzato. */
export function Display({
  children,
  className,
  as: Tag = 'h2',
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'p' | 'span';
} & Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'children'>) {
  return (
    <Tag className={cn('font-display font-medium text-pretty', className)} {...rest}>
      {children}
    </Tag>
  );
}
