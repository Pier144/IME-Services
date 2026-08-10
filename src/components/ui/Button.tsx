import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Un solo colore d'azione: l'oro. Blu e rosso sono colori di mondo, non di
 * bottone. Nessun raggio, nessuna ombra: la gerarchia la fa il riempimento.
 */
export type ButtonVariant = 'gold' | 'ghost' | 'ghostGold' | 'ghostSoft' | 'danger';

/** Le combinazioni padding/corpo/spaziatura effettivamente usate nei mockup. */
export type ButtonSize =
  | 'hero' // home, bottoni sotto il titolo
  | 'cta' // fascia CTA della home
  | 'ctaSm' // fasce CTA delle pagine interne
  | 'inline' // hero split di Impianti
  | 'form' // invio del form soggetti personalizzati
  | 'formSm' // invio della candidatura
  | 'block' // scheda soggetto, azione principale a piena larghezza
  | 'compact' // scheda soggetto, azione secondaria
  | 'admin'
  | 'adminSm';

const variants: Record<ButtonVariant, string> = {
  gold: 'bg-gold text-gold-ink font-semibold hover:brightness-94',
  ghost: 'border border-ghost text-ink font-medium hover:border-white',
  ghostGold: 'border border-gold text-gold font-medium hover:border-gold-hover hover:text-gold-hover',
  ghostSoft: 'border border-ghost-soft text-ink font-medium hover:border-ghost',
  danger: 'text-red font-medium hover:text-red hover:underline underline-offset-4',
};

const sizes: Record<ButtonSize, string> = {
  hero: 'px-28 py-13 text-13 tracking-12',
  cta: 'px-34 py-14 text-13 tracking-12',
  ctaSm: 'px-32 py-13 text-12-5 tracking-12',
  inline: 'px-26 py-13 text-12-5 tracking-12',
  form: 'px-34 py-14 text-12-5 tracking-12',
  formSm: 'px-32 py-14 text-12-5 tracking-12',
  block: 'w-full py-14 text-12-5 tracking-10',
  compact: 'px-20 py-14 text-12-5 tracking-10',
  admin: 'px-22 py-11 text-12-5 tracking-10',
  adminSm: 'px-18 py-9 text-12-5 tracking-08',
};

/**
 * L'area riservata ha l'angolo appena smussato, il sito pubblico no: sono le
 * taglie `admin` a dire da che parte sta un pulsante, perché nel progetto le
 * usa soltanto `/admin`.
 */
function radiusFor(size: ButtonSize) {
  return size === 'admin' || size === 'adminSm' ? 'rounded-soft' : 'rounded-none';
}

export function buttonClasses(
  variant: ButtonVariant = 'gold',
  size: ButtonSize = 'cta',
  className?: string,
) {
  return cn(
    'inline-flex items-center justify-center gap-8 text-center',
    radiusFor(size),
    'transition-[color,background-color,border-color,filter] duration-200 ease-out',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100',
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant, size, className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...rest} />;
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({ variant, size, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...rest} />;
}
