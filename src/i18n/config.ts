export const locales = ['it', 'en'] as const;

export type Locale = (typeof locales)[number];

/** L'italiano è la lingua di default e non ha prefisso nell'URL. */
export const defaultLocale: Locale = 'it';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Costruisce il path localizzato.
 *   localePath('it', '/luminarie') → '/luminarie'
 *   localePath('en', '/luminarie') → '/en/luminarie'
 */
export function localePath(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return clean || '/';
  return `/${locale}${clean}`;
}

/** Rimuove l'eventuale prefisso di lingua da un pathname. */
export function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

/** Codici usati in <html lang> e nei metadati Open Graph. */
export const htmlLang: Record<Locale, string> = { it: 'it-IT', en: 'en-GB' };
export const ogLocale: Record<Locale, string> = { it: 'it_IT', en: 'en_GB' };
