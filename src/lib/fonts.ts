import { Archivo, Work_Sans, Satisfy } from 'next/font/google';

/**
 * Font self-hostati da next/font: i file vengono scaricati a build time e serviti
 * dal nostro dominio, senza chiamate al CDN di Google (requisito del README).
 *
 * Archivo  → display (titoli, nomi soggetto, numeri). Peso 500; 800 italic solo
 *            dentro la pill del logo IME.
 * Work Sans→ testo: 300 paragrafi lunghi, 400 UI, 500 link/CTA, 600 bottone pieno.
 * Satisfy  → solo il wordmark "La Fabbrica di Babbo Natale".
 */

export const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '800'],
  style: ['normal', 'italic'],
  variable: '--font-archivo',
  display: 'swap',
});

export const workSans = Work_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-work-sans',
  display: 'swap',
});

export const satisfy = Satisfy({
  // Satisfy è pubblicato solo con il sottoinsieme latino di base.
  subsets: ['latin'],
  weight: '400',
  variable: '--font-satisfy',
  display: 'swap',
});

export const fontVariables = `${archivo.variable} ${workSans.variable} ${satisfy.variable}`;
