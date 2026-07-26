'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

/**
 * "Richiesta multipla": l'unico stato condiviso fra pagine.
 * Si riempie dalla scheda soggetto con "+ ALLA RICHIESTA" e si svuota nel form
 * dei soggetti personalizzati, che arriva già precompilato.
 *
 * Il deposito è localStorage, cioè un sistema esterno a React: per leggerlo si
 * usa `useSyncExternalStore`, che è il modo previsto per questi casi e mantiene
 * coerenti server e browser durante l'idratazione (sul server la richiesta è
 * sempre vuota).
 */

export type RequestItem = { slug: string; name: string; type: string };

const STORAGE_KEY = 'ime:richiesta';

/* --------------------------------------------------------------------------
 * Deposito
 * ----------------------------------------------------------------------- */

const EMPTY: RequestItem[] = [];

let cache: RequestItem[] | null = null;
const listeners = new Set<() => void>();

function readStorage(): RequestItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const items = parsed.filter(
      (item): item is RequestItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as RequestItem).slug === 'string' &&
        typeof (item as RequestItem).name === 'string',
    );
    return items.length > 0 ? items : EMPTY;
  } catch {
    return EMPTY;
  }
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Aggiorna anche quando la richiesta cambia in un'altra scheda del browser.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Riferimento stabile finché il contenuto non cambia: lo esige useSyncExternalStore. */
function getSnapshot(): RequestItem[] {
  cache ??= readStorage();
  return cache;
}

function getServerSnapshot(): RequestItem[] {
  return EMPTY;
}

function write(next: RequestItem[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Navigazione privata o spazio esaurito: la richiesta vale per questa sessione.
  }
  notify();
}

/* --------------------------------------------------------------------------
 * Contesto
 * ----------------------------------------------------------------------- */

type RequestValue = {
  items: RequestItem[];
  /** `false` durante il rendering sul server e alla prima passata nel browser. */
  ready: boolean;
  has: (slug: string) => boolean;
  add: (item: RequestItem) => void;
  remove: (slug: string) => void;
  toggle: (item: RequestItem) => void;
  clear: () => void;
};

const RequestContext = createContext<RequestValue | null>(null);

export function QuoteRequestProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const has = useCallback((slug: string) => items.some((item) => item.slug === slug), [items]);

  const add = useCallback(
    (item: RequestItem) => {
      if (items.some((existing) => existing.slug === item.slug)) return;
      write([...items, item]);
    },
    [items],
  );

  const remove = useCallback(
    (slug: string) => write(items.filter((item) => item.slug !== slug)),
    [items],
  );

  const toggle = useCallback(
    (item: RequestItem) => {
      const exists = items.some((existing) => existing.slug === item.slug);
      write(exists ? items.filter((existing) => existing.slug !== item.slug) : [...items, item]);
    },
    [items],
  );

  const clear = useCallback(() => write(EMPTY), []);

  const value = useMemo<RequestValue>(
    () => ({ items, ready, has, add, remove, toggle, clear }),
    [items, ready, has, add, remove, toggle, clear],
  );

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}

export function useQuoteRequest(): RequestValue {
  const value = useContext(RequestContext);
  if (!value) throw new Error('useQuoteRequest va usato dentro <QuoteRequestProvider>.');
  return value;
}
