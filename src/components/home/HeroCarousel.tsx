'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { Twinkles, twinklePresets } from '@/components/media/Twinkles';
import { useI18n } from '@/i18n/provider';
import { localePath } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { photos } from '@/data/photos';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 6500;

/**
 * Hero della home: quattro slide a tutta finestra, in crossfade da 700 ms.
 *
 * Il testo sta al centro e non in basso a sinistra, e il titolo è molto grande:
 * è quello che dà alla pagina il tono da manifesto. L'intestazione del sito si
 * appoggia sopra la foto (se ne occupa <Header>, che sulla home passa da sé in
 * modalità sovrapposta), quindi il velo è più carico in cima, altrimenti le
 * voci di menu non si leggerebbero sulle foto chiare.
 *
 * Autoplay ogni 6,5 s, in pausa quando il mouse è sopra o quando il fuoco della
 * tastiera è dentro. Le frecce stanno ai bordi e l'indice è ridotto a quattro
 * trattini: sono comandi veri, quindi la tastiera funziona senza scorciatoie
 * inventate. Con `prefers-reduced-motion: reduce` non parte niente: né
 * l'autoplay, né lo zoom lento della foto, né l'entrata del testo.
 */
export function HeroCarousel() {
  const { locale, t } = useI18n();
  const slides = t.home.hero.slides;

  /** Dove porta ogni slide, nell'ordine del dizionario. */
  const destinazioni = [
    routes.luminarie,
    `${routes.luminarie}?stagione=eventi`,
    routes.impianti,
    routes.custom,
  ];

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
      className="relative h-[86vh] min-h-560 overflow-hidden lg:h-screen"
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
            key={slide.label}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} / ${slides.length}`}
            aria-hidden={!active}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-linear',
              active ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <PhotoSlot
              label={slide.photo}
              src={photos.homeHero[slideIndex]}
              alt={slide.title}
              className={cn('absolute inset-0', active && 'hero-respiro')}
              labelPosition="top-right"
              priority={slideIndex === 0}
              sizes="100vw"
            />
            <div aria-hidden="true" className="veil-hero absolute inset-0" />
            {active && <Twinkles points={twinklePresets.homeHero} />}

            <div className="relative flex h-full flex-col items-center justify-center px-24 text-center">
              <p className="hero-occhiello font-body text-12 font-medium tracking-22 text-gold">
                {slide.label}
              </p>
              <h1
                className="hero-titolo mt-18 max-w-[15ch] font-display leading-[1.03] font-semibold text-balance text-white"
                style={{ fontSize: 'clamp(38px, 6.4vw, 82px)' }}
              >
                {slide.title}
              </h1>
              <p className="hero-riga mt-20 max-w-620 font-body text-16 leading-165 text-white/82 md:text-18">
                {slide.subtitle}
              </p>
              <Link
                href={localePath(locale, destinazioni[slideIndex])}
                tabIndex={active ? undefined : -1}
                className="hero-bottone mt-32 inline-flex items-center bg-gold px-34 py-16 font-body text-12 font-semibold tracking-18 text-gold-ink"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        );
      })}

      {/* Frecce ai bordi, a metà altezza */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        className="hero-freccia absolute top-1/2 left-8 z-20 -translate-y-1/2 px-14 py-20 text-34 leading-none text-white/70 lg:left-20"
      >
        <span aria-hidden="true">‹</span>
        <span className="sr-only">{t.home.hero.previous}</span>
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        className="hero-freccia absolute top-1/2 right-8 z-20 -translate-y-1/2 px-14 py-20 text-34 leading-none text-white/70 lg:right-20"
      >
        <span aria-hidden="true">›</span>
        <span className="sr-only">{t.home.hero.next}</span>
      </button>

      {/* Indice: quattro trattini. L'etichetta resta per chi usa lo screen reader. */}
      <div className="absolute inset-x-0 bottom-34 z-20 flex justify-center gap-10">
        {slides.map((slide, slideIndex) => {
          const active = slideIndex === index;
          return (
            <button
              key={slide.label}
              type="button"
              onClick={() => go(slideIndex)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'h-2 w-38 transition-colors duration-300 ease-out',
                active ? 'bg-gold' : 'bg-white/28 hover:bg-white/55',
              )}
            >
              <span className="sr-only">
                {t.home.hero.goTo} {slide.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
