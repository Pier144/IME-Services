'use client';

import { useId } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/i18n/provider';

/** «8 per pagina ▾» nel piede della lista. Scrive `perPagina` in querystring. */
export function PerPageSelect({ value, options }: { value: number; options: number[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const uid = useId();

  function cambia(next: string) {
    const search = new URLSearchParams(params.toString());
    search.set('perPagina', next);
    // Cambiando la misura della pagina, la pagina corrente non ha più senso.
    search.delete('pagina');
    const suffix = search.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname);
  }

  return (
    <span className="flex items-center gap-6">
      <label htmlFor={`${uid}-perpage`} className="sr-only">
        {t.admin.news.perPage}
      </label>
      <span className="relative">
        <select
          id={`${uid}-perpage`}
          value={value}
          onChange={(event) => cambia(event.target.value)}
          className="cursor-pointer appearance-none border-none bg-transparent pr-14 font-body text-13 font-medium text-ink-3 outline-none transition-colors duration-200 hover:text-gold focus-visible:text-gold"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option} {t.admin.news.perPage}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-9 text-ink-4"
        >
          ▼
        </span>
      </span>
    </span>
  );
}
