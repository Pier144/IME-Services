import type { CSSProperties } from 'react';

export type Twinkle = {
  size: 2 | 3;
  /** Posizioni assolute, in px o percentuale. */
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  /** Ritardi sfalsati: 0 / .4 / .8 / 1.2 / 1.6 / 2.2s. */
  delay?: number;
};

/**
 * Le lucine che pulsano su hero e fasce CTA: 2-5 per sezione, mai di più.
 * È l'unica animazione decorativa del sito e si spegne da sola con
 * `prefers-reduced-motion: reduce` (regola in globals.css).
 */
export function Twinkles({ points }: { points: readonly Twinkle[] }) {
  return (
    <>
      {points.map((point, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="twinkle"
          style={
            {
              width: `${point.size}px`,
              height: `${point.size}px`,
              top: point.top,
              bottom: point.bottom,
              left: point.left,
              right: point.right,
              animationDelay: point.delay ? `${point.delay}s` : undefined,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

/**
 * Disposizioni riprese dal mockup, sezione per sezione.
 *
 * Nel mockup le posizioni sono in pixel su una pagina larga 1200: qui sono
 * convertite in percentuale, così su schermo stretto i pallini restano dentro
 * la loro sezione invece di spingere la pagina a scorrere di lato.
 */
export const twinklePresets = {
  // hero home, 1200 × 600
  homeHero: [
    { size: 3, top: '15%', left: '15%' },
    { size: 2, top: '25%', left: '35%', delay: 0.8 },
    { size: 3, top: '12%', left: '63%', delay: 1.6 },
    { size: 2, top: '30%', left: '84%', delay: 0.4 },
    { size: 2, top: '43%', left: '73%', delay: 2.2 },
  ],
  // hero delle pagine interne, 1200 × 300
  pageHero: [
    { size: 3, top: '20%', left: '22%' },
    { size: 2, top: '37%', left: '68%', delay: 1.1 },
  ],
  // apertura articolo, 1200 × 420
  articleHero: [
    { size: 3, top: '19%', left: '25%' },
    { size: 2, top: '33%', right: '23%', delay: 1.5 },
  ],
  ctaPage: [
    { size: 3, top: '13%', left: '14%' },
    { size: 2, bottom: '17%', right: '17%', delay: 1.4 },
  ],
  ctaAbout: [
    { size: 3, top: '14%', left: '13%' },
    { size: 2, bottom: '15%', right: '16%', delay: 1.3 },
  ],
} satisfies Record<string, readonly Twinkle[]>;
