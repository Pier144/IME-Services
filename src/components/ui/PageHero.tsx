import { PhotoSlot } from '@/components/media/PhotoSlot';
import { Twinkles, twinklePresets } from '@/components/media/Twinkles';
import { Display, Eyebrow } from './Typography';
import { cn } from '@/lib/utils';

/**
 * Fascia-foto di apertura delle pagine interne.
 * Altezze da mockup: 300 (Luminarie) · 320 (Lavora con noi) · 340 (Chi siamo).
 * Sotto i 900px scendono a 240px, come da regole responsive del README.
 */
export function PageHero({
  eyebrow,
  eyebrowTone = 'gold',
  title,
  intro,
  photo,
  photoSrc,
  height = 300,
  showTwinkles = true,
  children,
}: {
  eyebrow: string;
  eyebrowTone?: 'gold' | 'muted';
  title: React.ReactNode;
  intro?: string;
  photo: string;
  photoSrc?: string | null;
  height?: 300 | 320 | 340;
  showTwinkles?: boolean;
  children?: React.ReactNode;
}) {
  const heights = {
    300: 'h-240 md:h-300',
    320: 'h-240 md:h-320',
    340: 'h-260 md:h-340',
  } as const;

  return (
    <section className={cn('relative overflow-hidden', heights[height])}>
      <PhotoSlot
        label={photo}
        src={photoSrc}
        className="absolute inset-0"
        labelPosition="top-right"
        priority
        sizes="100vw"
      />
      <div aria-hidden="true" className="veil-page absolute inset-0" />
      {showTwinkles && <Twinkles points={twinklePresets.pageHero} />}
      <div className="absolute inset-x-0 bottom-44 px-24 lg:px-90">
        <Eyebrow tone={eyebrowTone} size="sm" tracking="16" className="mb-12">
          {eyebrow}
        </Eyebrow>
        <Display as="h1" className="text-32 leading-110 md:text-46">
          {title}
        </Display>
        {intro && (
          <p className="mt-10 max-w-520 font-body text-16 leading-170 text-ink-2">
            {intro}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
