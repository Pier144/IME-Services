'use client';

import { useEffect, useId, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Field';
import { useI18n } from '@/i18n/provider';

/**
 * Ricerca per titolo con attesa di 300 ms: si scrive, e solo quando ci si
 * ferma la querystring cambia. Così l'indirizzo resta condivisibile senza
 * ricaricare la lista a ogni tasto.
 */
export function ArticleSearch({ initialQuery, status }: { initialQuery: string; status: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const uid = useId();

  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (value === initialQuery) return;
      const search = new URLSearchParams();
      if (value.trim()) search.set('q', value.trim());
      if (status !== 'all') search.set('stato', status);
      const suffix = search.toString();
      router.replace(suffix ? `${pathname}?${suffix}` : pathname);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [value, initialQuery, status, pathname, router]);

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
    </>
  );
}
