import type { Locale } from '@/i18n/config';

/**
 * Formattazione delle date.
 *
 * Le tabelle dei mesi sono scritte a mano invece di usare `Intl`: il risultato
 * è identico sul server e nel browser (nessuna differenza di ICU, nessun
 * disallineamento in idratazione) e le maiuscole restano quelle del design.
 * Le date si leggono sempre in UTC, così la sola data di pubblicazione non
 * cambia giorno a seconda del fuso di chi guarda.
 */

const MONTHS_SHORT: Record<Locale, readonly string[]> = {
  it: ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
};

const MONTHS_LONG: Record<Locale, readonly string[]> = {
  it: [
    'GENNAIO',
    'FEBBRAIO',
    'MARZO',
    'APRILE',
    'MAGGIO',
    'GIUGNO',
    'LUGLIO',
    'AGOSTO',
    'SETTEMBRE',
    'OTTOBRE',
    'NOVEMBRE',
    'DICEMBRE',
  ],
  en: [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ],
};

/** "12 DIC 2025" per liste ed elenchi. */
export function formatShortDate(date: Date, locale: Locale): string {
  return `${date.getUTCDate().toString().padStart(2, '0')} ${MONTHS_SHORT[locale][date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "12 DICEMBRE 2025" per l apertura dell'articolo. */
export function formatLongDate(date: Date, locale: Locale): string {
  return `${date.getUTCDate()} ${MONTHS_LONG[locale][date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "12/12/2025" per la tabella dell'area riservata. */
export function formatNumericDate(date: Date): string {
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

/** "2025-12-12" per il valore degli <input type="date"> e degli attributi datetime. */
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

export function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** "2 min fa" per il timestamp di autosalvataggio dell'editor. */
export function formatRelativeTime(from: Date, now: Date, locale: Locale): string {
  const seconds = Math.max(0, Math.round((now.getTime() - from.getTime()) / 1000));

  if (seconds < 45) return locale === 'it' ? 'adesso' : 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    if (locale === 'it') return minutes <= 1 ? '1 minuto fa' : `${minutes} minuti fa`;
    return minutes <= 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  const hours = Math.round(minutes / 60);
  if (locale === 'it') return hours <= 1 ? "1 ora fa" : `${hours} ore fa`;
  return hours <= 1 ? '1 hour ago' : `${hours} hours ago`;
}
