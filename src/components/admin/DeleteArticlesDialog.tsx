'use client';

import { useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Display } from '@/components/ui/Typography';
import { useI18n } from '@/i18n/provider';

/**
 * Conferma di eliminazione, da uno a molti articoli.
 *
 * Una finestra sola per la riga singola e per la selezione multipla: il testo
 * cambia, il comportamento no. Elimina è l'unica azione irreversibile
 * dell'area riservata e non deve avere due implementazioni che possono
 * divergere.
 *
 * Chi apre la finestra decide *cosa* eliminare; questa sa solo mostrarlo e
 * chiedere conferma.
 */

export type ArticoloDaEliminare = {
  id: string;
  title: string;
  published: boolean;
};

export function DeleteArticlesDialog({
  articles,
  busy,
  onCancel,
  onConfirm,
}: {
  articles: ArticoloDaEliminare[];
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    dialog.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  if (articles.length === 0) return null;

  const molti = articles.length > 1;
  const online = articles.filter((article) => article.published).length;

  const titolo = molti
    ? t.admin.news.deleteTitleMany.replace('{count}', String(articles.length))
    : t.admin.news.deleteTitle;

  const avviso =
    online === 0
      ? null
      : online === 1
        ? t.admin.news.deleteOnlineWarning
        : t.admin.news.deleteOnlineWarningMany.replace('{count}', String(online));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 px-24"
      onClick={(event) => event.target === event.currentTarget && onCancel()}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={uid}
        tabIndex={-1}
        className="w-full max-w-460 rounded-soft border border-hairline bg-panel-ime px-24 py-28 md:px-32"
      >
        <Display as="h2" id={uid} className="text-21 md:text-24">
          {titolo}
        </Display>

        <p className="mt-10 font-body text-15 leading-170 font-medium text-ink-3">
          {molti ? t.admin.news.deleteTextMany : t.admin.news.deleteText}
        </p>

        {/* I titoli si vedono tutti: confermare alla cieca su una selezione
            non è confermare. */}
        <ul className="mt-14 flex max-h-240 flex-col gap-6 overflow-y-auto border-l-2 border-field-border pl-14 font-body text-15 text-ink-2">
          {articles.map((article) => (
            <li key={article.id}>
              {article.title}
              {article.published && (
                <span className="text-gold"> {t.admin.news.deletePublishedMark}</span>
              )}
            </li>
          ))}
        </ul>

        {avviso && <p className="mt-12 font-body text-13 font-medium text-ink-3">{avviso}</p>}

        <div className="mt-24 flex flex-wrap items-center gap-16">
          <Button variant="ghostSoft" size="adminSm" onClick={onCancel} disabled={busy}>
            {t.common.cancel}
          </Button>
          <Button variant="danger" size="adminSm" onClick={onConfirm} disabled={busy}>
            {t.admin.news.deleteConfirm}
          </Button>
        </div>
      </div>
    </div>
  );
}
