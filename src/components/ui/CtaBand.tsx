import { ButtonLink } from './Button';
import { Display } from './Typography';
import { Twinkles, twinklePresets, type Twinkle } from '@/components/media/Twinkles';
import { cn } from '@/lib/utils';

/**
 * La fascia CTA: una sola per pagina, sempre prima del footer.
 * Gradiente fisso `135deg #141b36 → #1b1430`, bordo `cta-line`, twinkle sopra.
 */
export function CtaBand({
  title,
  subtitle,
  buttonLabel,
  href,
  variant = 'page',
  twinkles = twinklePresets.ctaPage,
  className,
}: {
  title: string;
  subtitle: string;
  buttonLabel: string;
  href: string;
  variant?: 'home' | 'page';
  twinkles?: readonly Twinkle[];
  className?: string;
}) {
  const home = variant === 'home';

  return (
    <section
      className={cn(
        'cta-band relative mx-24 overflow-hidden text-center lg:mx-90',
        home ? 'px-24 py-56 lg:px-60' : 'px-24 py-52 lg:px-60',
        className,
      )}
    >
      <Twinkles points={twinkles} />
      <Display as="h2" className={home ? 'text-34' : 'text-30'}>
        {title}
      </Display>
      <p className="mt-10 font-body text-16 text-ink-3">{subtitle}</p>
      <ButtonLink
        href={href}
        variant="gold"
        size={home ? 'cta' : 'ctaSm'}
        className={home ? 'mt-24' : 'mt-22'}
      >
        {buttonLabel} <span aria-hidden="true">→</span>
      </ButtonLink>
    </section>
  );
}
