'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Display } from '@/components/ui/Typography';
import { useI18n } from '@/i18n/provider';
import { apiRoutes } from '@/lib/routes';

/**
 * Eliminazione con conferma: mai un colpo solo.
 * La finestra parla la stessa lingua visiva del resto (fondo `panel-ime`,
 * filetti, nessun raggio) e l'azione distruttiva è testuale in rosso.
 */
export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    dialog.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

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
        <span className="sr-only"> — {title}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 px-24"
          onClick={(event) => event.target === event.currentTarget && setOpen(false)}
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-${id}`}
            tabIndex={-1}
            className="w-full max-w-460 border border-hairline bg-panel-ime px-24 py-28 md:px-32"
          >
            <Display as="h2" id={`delete-${id}`} className="text-21 md:text-24">
              {t.admin.news.deleteTitle}
            </Display>
            <p className="mt-10 font-body text-15 leading-170 font-medium text-ink-3">
              {t.admin.news.deleteText}
            </p>
            <p className="mt-14 border-l-2 border-field-border pl-14 font-body text-15 text-ink-2">
              {title}
            </p>

            <div className="mt-24 flex flex-wrap items-center gap-16">
              <Button variant="ghostSoft" size="adminSm" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button variant="danger" size="adminSm" onClick={confirm} disabled={busy}>
                {t.admin.news.deleteConfirm}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
