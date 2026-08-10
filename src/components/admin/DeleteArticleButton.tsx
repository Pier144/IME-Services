'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeleteArticlesDialog } from './DeleteArticlesDialog';
import { useI18n } from '@/i18n/provider';
import { apiRoutes } from '@/lib/routes';

/**
 * Eliminazione di una riga, con conferma: mai un colpo solo.
 * La finestra è la stessa della selezione multipla — vedi
 * `DeleteArticlesDialog` — così i due percorsi non possono divergere.
 */
export function DeleteArticleButton({
  id,
  title,
  published = false,
}: {
  id: string;
  title: string;
  published?: boolean;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);

  // Chiusa la finestra, il fuoco torna da dove era partito.
  useEffect(() => {
    if (!open) opener.current?.focus();
  }, [open]);

  async function confirm() {
    setBusy(true);
    try {
      const response = await fetch(apiRoutes.article(id), { method: 'DELETE' });
      if (response.ok) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        className="font-body text-12-5 tracking-06 text-ink-3 transition-colors duration-200 hover:text-red"
      >
        {t.admin.news.delete}
        <span className="sr-only">: {title}</span>
      </button>

      {open && (
        <DeleteArticlesDialog
          articles={[{ id, title, published }]}
          busy={busy}
          onCancel={() => setOpen(false)}
          onConfirm={() => void confirm()}
        />
      )}
    </>
  );
}
