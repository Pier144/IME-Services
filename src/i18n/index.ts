import it from './dictionaries/it';
import en from './dictionaries/en';
import { defaultLocale, type Locale } from './config';
import type { Dictionary } from './types';

const dictionaries: Record<Locale, Dictionary> = { it, en };

/** Il dizionario della lingua richiesta. Sincrono: sono moduli statici. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export type { Dictionary };
export { defaultLocale };
export type { Locale };
