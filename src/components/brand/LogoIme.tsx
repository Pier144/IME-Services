import { cn } from '@/lib/utils';

type Size = 'header' | 'footer' | 'admin';

const pill: Record<Size, string> = {
  header: 'px-15 py-6 text-14',
  footer: 'px-13 py-5 text-12',
  admin: 'px-13 py-5 text-12',
};

const label: Record<Size, string> = {
  header: 'text-10 tracking-28',
  footer: 'text-9 tracking-26',
  admin: 'text-9 tracking-24',
};

/**
 * Lockup del marchio IME Service: pill blu con la "E" gialla + la scritta
 * affiancata. Oggi è tipografico; quando arriverà l'SVG ufficiale si sostituisce
 * il contenuto di questo file e cambia ovunque.
 */
export function LogoIme({
  size = 'header',
  text = 'SERVICE',
  className,
}: {
  size?: Size;
  text?: string;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-10', size !== 'header' && 'gap-9', className)}>
      <span
        className={cn(
          'rounded-pill bg-blue font-display font-extrabold italic text-white tracking-logo',
          pill[size],
        )}
      >
        IM<span className="text-logo-yellow">E</span>
      </span>
      <span className={cn('font-medium text-logo-label', label[size])}>{text}</span>
      <span className="sr-only">IME Service</span>
    </span>
  );
}
