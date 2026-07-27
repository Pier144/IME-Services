import { Archivo, Satisfy } from 'next/font/google';

/**
 * Font self-hostati da next/font: i file vengono scaricati a build time e serviti
 * dal nostro dominio, senza chiamate al CDN di Google (requisito del README).
 *
 * Una sola famiglia per tutto il sito, titoli e testo:
 *
 * Archivo → 400 il corpo dei paragrafi, 500 il testo sotto i 16px e i titoli,
 *           600 i bottoni pieni, 800 italic dentro la pill del logo IME.
 * Satisfy → solo il wordmark "La Fabbrica di Babbo Natale".
 *
 * Archivo è caricato come font variabile — nessun `weight` dichiarato — quindi
 * arrivano due soli file (tondo e corsivo) invece di otto tagli statici, e tutti
 * i pesi restano disponibili. Prima di questo cambio il testo era in Work Sans
 * peso 300, e quel peso è la ragione per cui il sito risultava esile: chiaro su
 * fondo scuro i tratti sottili si sfilacciano. Non va reintrodotto.
 */

export const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  variable: '--font-archivo',
  display: 'swap',
});

export const satisfy = Satisfy({
  // Satisfy è pubblicato solo con il sottoinsieme latino di base.
  subsets: ['latin'],
  weight: '400',
  variable: '--font-satisfy',
  display: 'swap',
});

export const fontVariables = `${archivo.variable} ${satisfy.variable}`;
