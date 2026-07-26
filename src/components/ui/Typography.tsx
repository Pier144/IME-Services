import { cn } from '@/lib/utils';

/**
 * Etichetta di sezione: 11.5px, letter-spacing .34em, testo secondario.
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
        'font-body text-11-5 font-normal tracking-34',
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
 * `tracking` va scelto secondo il mockup (.3em hero, .26em breadcrumb soggetto,
 * .24em card laterali, .22em pannelli, .18em meta articolo).
 */
export function Eyebrow({
  children,
  className,
  tone = 'gold',
  size = 'md',
  tracking = '30',
  as: Tag = 'p',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'gold' | 'muted' | 'blue' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  tracking?: '18' | '20' | '22' | '24' | '26' | '30' | '34';
  as?: 'p' | 'div' | 'span' | 'h2';
}) {
  const tones = {
    gold: 'text-gold',
    muted: 'text-ink-3',
    blue: 'text-blue-lt',
    rose: 'text-rose',
  } as const;
  const sizes = { sm: 'text-11', md: 'text-11-5', lg: 'text-12' } as const;
  const trackings = {
    '18': 'tracking-18',
    '20': 'tracking-20',
    '22': 'tracking-22',
    '24': 'tracking-24',
    '26': 'tracking-26',
    '30': 'tracking-30',
    '34': 'tracking-34',
  } as const;

  return (
    <Tag
      className={cn('font-body font-normal', sizes[size], trackings[tracking], tones[tone], className)}
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
