'use client';

import { useEffect, useId, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Input, Select } from '@/components/ui/Field';
import { useI18n } from '@/i18n/provider';

/**
 * Ricerca e filtri della lista articoli (handoff 6a).
 *
 * Tutto finisce in querystring — `q`, `stato`, `categoria`, `anno` — perché
 * l'indirizzo resti condivisibile: mandare a un collega «gli articoli di
 * Natale del 2025» deve poter essere un link, non una spiegazione.
 *
 * La ricerca attende 300 ms dopo l'ultimo tasto; i due menù agiscono subito,
 * perché una scelta da un elenco è già definitiva.
 */

export type FiltriArticoli = {
  query: string;
  status: string;
  category: string;
  year: string;
};

export function ArticleSearch({
  filters,
  categories,
  years,
}: {
  filters: FiltriArticoli;
  categories: Array<{ slug: string; name: string }>;
  years: number[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const uid = useId();

  const [value, setValue] = useState(filters.query);

  /** Un solo posto costruisce l'indirizzo: i quattro filtri non si perdono a vicenda. */
  function hrefCon(cambi: Partial<FiltriArticoli>): string {
    const next = { ...filters, ...cambi };
    const search = new URLSearchParams();
    if (next.query.trim()) search.set('q', next.query.trim());
    if (next.status !== 'all') search.set('stato', next.status);
    if (next.category) search.set('categoria', next.category);
    if (next.year) search.set('anno', next.year);
    const suffix = search.toString();
    return suffix ? `${pathname}?${suffix}` : pathname;
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (value === filters.query) return;
      router.replace(hrefCon({ query: value }));
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hrefCon si ricostruisce a ogni render
  }, [value, filters.query, router]);

  return (
    <>
      <label htmlFor={`${uid}-search`} className="sr-only">
        {t.admin.news.searchLabel}
      </label>
      <Input
        id={`${uid}-search`}
        type="search"
        tone="admin"
        className="w-full md:w-200"
        placeholder={t.admin.news.search}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      <label htmlFor={`${uid}-category`} className="sr-only">
        {t.admin.news.filterCategory}
      </label>
      <Select
        id={`${uid}-category`}
        tone="admin"
        className="w-full md:w-180"
        value={filters.category}
        onChange={(event) => router.replace(hrefCon({ category: event.target.value }))}
      >
        <option value="">{t.admin.news.allCategories}</option>
        {categories.map((categoria) => (
          <option key={categoria.slug} value={categoria.slug}>
            {categoria.name}
          </option>
        ))}
      </Select>

      <label htmlFor={`${uid}-year`} className="sr-only">
        {t.admin.news.filterYear}
      </label>
      <Select
        id={`${uid}-year`}
        tone="admin"
        className="w-full md:w-130"
        value={filters.year}
        onChange={(event) => router.replace(hrefCon({ year: event.target.value }))}
      >
        <option value="">{t.admin.news.allYears}</option>
        {years.map((anno) => (
          <option key={anno} value={String(anno)}>
            {anno}
          </option>
        ))}
      </Select>
    </>
  );
}
