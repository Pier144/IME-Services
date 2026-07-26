'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { Twinkles, twinklePresets } from '@/components/media/Twinkles';
import { ButtonLink } from '@/components/ui/Button';
import { Display, Eyebrow } from '@/components/ui/Typography';
import { useI18n } from '@/i18n/provider';
import { localePath } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 6000;

/**
 * Hero della home: quattro slide in crossfade da 600 ms.
 *
 * Autoplay ogni 6 s, in pausa quando il mouse è sopra o quando il fuoco della
 * tastiera è dentro. Frecce e indice sono comandi veri, quindi la navigazione
 * da tastiera funziona senza scorciatoie inventate. Con
 * `prefers-reduced-motion: reduce` l'autoplay non parte proprio: si resta sulla
 * prima slide e si cambia solo a mano.
 */
export function HeroCarousel() {
  const { locale, t } = useI18n();
  const slides = t.home.hero.slides;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const region = useRef<HTMLElement>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [index, paused, reducedMotion, go]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(index + 1);
    }
  };

  return (
    <section
      ref={region}
      aria-roledescription="carousel"
      aria-label={t.home.hero.eyebrow}
      className="relative h-380 overflow-hidden md:h-480 lg:h-600"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      {slides.map((slide, slideIndex) => {
        const active = slideIndex === index;
        return (
          <div
            key={slide.index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} / ${slides.length}`}
            aria-hidden={!active}
            className={cn(
              'absolute inset-0 transition-opacity duration-600 ease-linear',
              active ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <PhotoSlot
              label={slide.photo}
              className="absolute inset-0"
              labelPosition="top-right"
              priority={slideIndex === 0}
              sizes="100vw"
            />
            <div aria-hidden="true" className="veil-home absolute inset-0" />
            {active && <Twinkles points={twinklePresets.homeHero} />}

            <div className="absolute inset-x-0 bottom-44 px-24 lg:bottom-64 lg:px-90">
              <Eyebrow tone="gold" size="md" tracking="34" className="mb-14">
                {t.home.hero.eyebrow}
              </Eyebrow>
              <Display
                as={slideIndex === 0 ? 'h1' : 'p'}
                className="max-w-640 text-32 leading-112 md:text-40 lg:text-58"
              >
                {slide.title}
              </Display>
              <p className="mt-14 max-w-520 font-body text-15 leading-160 font-light text-ink-2 md:text-17">
                {slide.subtitle}
              </p>
              <div className="mt-26 flex flex-wrap gap-14">
                <ButtonLink
                  href={localePath(locale, routes.luminarie)}
                  variant="ghostGold"
                  size="hero"
                  tabIndex={active ? undefined : -1}
                >
                  {t.home.hero.ctaPrimary}
                </ButtonLink>
                <ButtonLink
                  href={localePath(locale, routes.custom)}
                  variant="ghost"
                  size="hero"
                  tabIndex={active ? undefined : -1}
                >
                  {t.home.hero.ctaSecondary}
                </ButtonLink>
              </div>
            </div>
          </div>
        );
      })}

      {/* Frecce circolari 44px, centrate ai lati a 22px */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        className="absolute top-1/2 left-22 flex size-44 -translate-y-1/2 items-center justify-center rounded-full border border-arrow text-18 text-white transition-colors duration-200 ease-out hover:border-white"
      >
        <span aria-hidden="true">‹</span>
        <span className="sr-only">{t.home.hero.previous}</span>
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        className="absolute top-1/2 right-22 flex size-44 -translate-y-1/2 items-center justify-center rounded-full border border-arrow text-18 text-white transition-colors duration-200 ease-out hover:border-white"
      >
        <span aria-hidden="true">›</span>
        <span className="sr-only">{t.home.hero.next}</span>
      </button>

      {/* Indice delle slide, in basso a destra */}
      <div className="absolute right-24 bottom-14 hidden items-center gap-22 font-body text-11 tracking-14 md:flex lg:right-90 lg:bottom-64">
        {slides.map((slide, slideIndex) => {
          const active = slideIndex === index;
          return (
            <button
              key={slide.index}
              type="button"
              onClick={() => go(slideIndex)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'pb-4 transition-colors duration-200 ease-out',
                active ? 'border-b border-gold text-gold' : 'text-ink-3 hover:text-gold',
              )}
            >
              <span className="sr-only">{t.home.hero.goTo} </span>
              {slide.index} {slide.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
