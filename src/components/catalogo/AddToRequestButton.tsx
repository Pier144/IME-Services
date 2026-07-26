'use client';

import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n/provider';
import { useQuoteRequest } from '@/lib/request-context';

/**
 * "+ ALLA RICHIESTA": accumula soggetti in un'unica richiesta di preventivo.
 * L'elenco vive nel contesto condiviso (e in localStorage) e arriva
 * precompilato nel form dei soggetti personalizzati.
 */
export function AddToRequestButton({
  slug,
  name,
  type,
}: {
  slug: string;
  name: string;
  type: string;
}) {
  const { t } = useI18n();
  const { has, toggle, ready } = useQuoteRequest();
  const selected = ready && has(slug);

  return (
    <Button
      variant={selected ? 'ghostGold' : 'ghost'}
      size="compact"
      onClick={() => toggle({ slug, name, type })}
      aria-pressed={selected}
      className="flex-none"
    >
      {selected ? t.subject.inRequest : t.subject.addToRequest}
    </Button>
  );
}
