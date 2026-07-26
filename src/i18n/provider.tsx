'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Locale } from './config';
import type { Dictionary } from './types';

type I18nValue = {
  locale: Locale;
  t: Dictionary;
};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Rende dizionario e lingua disponibili ai componenti client.
 * I dizionari sono oggetti serializzabili, quindi passano dal server al client
 * senza trucchi: nessuna stringa viene duplicata nei bundle di pagina.
 */
export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: dictionary }}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useI18n va usato dentro <I18nProvider>.');
  }
  return value;
}
