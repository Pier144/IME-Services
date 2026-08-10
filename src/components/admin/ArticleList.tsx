'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DeleteArticleButton } from './DeleteArticleButton';
import { DeleteArticlesDialog } from './DeleteArticlesDialog';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { ArticleMeta } from '@/components/news/ArticleMeta';
import { StatusBadge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n/provider';
import { defaultLocale } from '@/i18n/config';
import { adminRoutes, apiRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

/**
 * Lista articoli con selezione multipla (handoff 6a).
 *
 * Vive nel browser perché la selezione è stato dell'interfaccia: la pagina
 * resta un componente server che interroga il database e passa qui le righe
 * già pronte.
 *
 * Regola dell'handoff: schede di stato e barra delle azioni **non convivono**.
 * Appena si seleziona qualcosa la riga delle schede sparisce e al suo posto
 * compare la barra. Chi ha una selezione aperta sta facendo un'altra cosa, e
 * lasciargli i filtri sotto le dita invita a perderla per sbaglio.
 */

export type RigaArticolo = {
  id: string;
  title: string;
  category: string;
  publishedAt: Date | null;
  status: 'draft' | 'published';
  featured: boolean;
  coverImage: string | null;
};

export type SchedaStato = {
  key: 'all' | 'published' | 'draft';
  label: string;
  count: number;
  href: string;
};

export function ArticleList({
  articles,
  tabs,
  activeTab,
  categories,
  emptyLabel,
}: {
  articles: RigaArticolo[];
  tabs: SchedaStato[];
  activeTab: 'all' | 'published' | 'draft';
  categories: Array<{ slug: string; name: string }>;
  emptyLabel: string;
}) {
  const { t } = useI18n();
  const router = useRouter();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const selezione = articles.filter((article) => selected.has(article.id));
  const inSelezione = selezione.length > 0;
  const tutti = articles.length > 0 && selezione.length === articles.length;

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTutti() {
    setSelected(tutti ? new Set() : new Set(articles.map((article) => article.id)));
  }

  function annulla() {
    setSelected(new Set());
    setError(null);
  }

  async function applica(body: Record<string, unknown>, method: 'PATCH' | 'DELETE') {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(apiRoutes.articles, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], ...body }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? t.admin.news.bulkFailed);
        return;
      }
      setSelected(new Set());
      setConfirming(false);
      router.refresh();
    } catch {
      setError(t.admin.news.bulkFailed);
    } finally {
      setBusy(false);
    }
  }

  const contatore = `${selezione.length} ${
    selezione.length === 1 ? t.admin.news.selectedOne : t.admin.news.selected
  }`;

  return (
    <>
      {inSelezione ? (
        <div className="mt-26 flex flex-wrap items-center justify-between gap-20 border-b border-hairline-strong bg-gold-rail px-14 py-11">
          <span className="flex items-center gap-12 font-body text-13 tracking-10 text-gold">
            <span aria-hidden="true">✓</span>
            {contatore}
          </span>

          <span className="flex flex-wrap items-center gap-18 font-body text-13 font-medium text-ink-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void applica({ status: 'published' }, 'PATCH')}
              className="transition-colors duration-200 hover:text-gold disabled:opacity-50"
            >
              {t.admin.news.bulkPublish}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void applica({ status: 'draft' }, 'PATCH')}
              className="transition-colors duration-200 hover:text-gold disabled:opacity-50"
            >
              {t.admin.news.bulkDraft}
            </button>

            <label className="flex items-center gap-6">
              <span className="sr-only">{t.admin.news.bulkCategory}</span>
              <select
                disabled={busy}
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) void applica({ category: event.target.value }, 'PATCH');
                  event.target.value = '';
                }}
                className="cursor-pointer appearance-none border-none bg-transparent pr-12 font-body text-13 font-medium text-ink-2 outline-none transition-colors duration-200 hover:text-gold focus-visible:text-gold"
              >
                <option value="">{t.admin.news.bulkCategory} ▾</option>
                {categories.map((categoria) => (
                  <option key={categoria.slug} value={categoria.slug}>
                    {categoria.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming(true)}
              className="font-semibold text-red transition-colors duration-200 hover:text-rose disabled:opacity-50"
            >
              {t.admin.news.delete}
            </button>

            <span aria-hidden="true" className="text-ink-4">
              |
            </span>

            <button
              type="button"
              onClick={annulla}
              className="text-ink-3 transition-colors duration-200 hover:text-gold"
            >
              {t.admin.news.bulkCancel}
            </button>
          </span>
        </div>
      ) : (
        <nav className="mt-26 flex items-center justify-between gap-20 border-b border-hairline-strong">
          <span className="flex gap-26 overflow-x-auto font-body text-13 tracking-10">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                aria-current={activeTab === tab.key ? 'page' : undefined}
                className={cn(
                  'flex-none pb-12 whitespace-nowrap transition-colors duration-200 ease-out',
                  activeTab === tab.key ? 'text-gold shadow-tab-active' : 'text-ink-3 hover:text-gold',
                )}
              >
                {tab.label} ({tab.count})
              </Link>
            ))}
          </span>

          {articles.length > 0 && (
            <label className="flex flex-none cursor-pointer items-center gap-8 pb-12 font-body text-13 text-ink-3 transition-colors duration-200 hover:text-gold">
              <Casella checked={false} onChange={toggleTutti} />
              {t.admin.news.selectAll}
            </label>
          )}
        </nav>
      )}

      {error && (
        <p role="alert" className="border-b border-red px-14 py-10 font-body text-13 text-red">
          {error}
        </p>
      )}

      {articles.length === 0 ? (
        <p className="border-b border-hairline py-40 text-center font-body text-15 font-medium text-ink-3">
          {emptyLabel}
        </p>
      ) : (
        <ul>
          {articles.map((article) => {
            const scelto = selected.has(article.id);
            return (
              <li
                key={article.id}
                className={cn(
                  'group flex items-center gap-20 border-b border-hairline-soft py-16 transition-colors duration-200',
                  scelto ? 'bg-gold-rail shadow-rail-active' : 'hover:bg-white/2',
                )}
              >
                <Casella
                  checked={scelto}
                  onChange={() => toggle(article.id)}
                  label={article.title || t.admin.editor.newArticle}
                />

                <PhotoSlot
                  label="img"
                  src={article.coverImage}
                  alt=""
                  className="h-58 w-88 flex-none"
                  labelClassName="text-8 px-4 py-2"
                  sizes="88px"
                />

                <span className="min-w-0 flex-1">
                  <Link
                    href={adminRoutes.article(article.id)}
                    className="block font-body text-17 font-medium text-ink transition-colors duration-200 hover:text-gold"
                  >
                    {article.title || t.admin.editor.newArticle}
                  </Link>
                  <ArticleMeta
                    category={article.category}
                    date={article.publishedAt}
                    noDateLabel={t.admin.news.noDate}
                    featuredLabel={article.featured ? t.admin.news.featured : undefined}
                    locale={defaultLocale}
                    size="admin"
                    className="mt-6"
                  />
                </span>

                <StatusBadge
                  status={article.status}
                  label={
                    article.status === 'draft'
                      ? t.admin.news.status.draft
                      : t.admin.news.status.published
                  }
                />

                <span className="flex w-110 flex-none items-center justify-end gap-8 font-body text-12-5 tracking-06">
                  <Link
                    href={adminRoutes.article(article.id)}
                    className="text-gold transition-colors duration-200 hover:text-gold-hover"
                  >
                    {t.admin.news.edit}
                  </Link>
                  {/* «Elimina» a riposo non si vede: è l'unica azione irreversibile
                      della riga e non deve stare sotto il dito per sbaglio. */}
                  <span className="flex items-center gap-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    <span aria-hidden="true" className="text-ink-4">
                      ·
                    </span>
                    <DeleteArticleButton
                      id={article.id}
                      title={article.title || t.admin.editor.newArticle}
                      published={article.status === 'published'}
                    />
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {confirming && (
        <DeleteArticlesDialog
          articles={selezione.map((article) => ({
            id: article.id,
            title: article.title || t.admin.editor.newArticle,
            published: article.status === 'published',
          }))}
          busy={busy}
          onCancel={() => setConfirming(false)}
          onConfirm={() => void applica({}, 'DELETE')}
        />
      )}
    </>
  );
}

/** Quadrato 15px senza raggio: selezionato si riempie d'oro con la spunta. */
function Casella({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <span className="relative flex size-15 flex-none items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className={cn(
          'size-15 cursor-pointer appearance-none rounded-none border bg-transparent',
          'transition-colors duration-200 ease-out',
          checked ? 'border-gold bg-gold' : 'border-check hover:border-gold',
        )}
      />
      {checked && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute text-10 leading-none font-semibold text-gold-ink"
        >
          ✓
        </span>
      )}
    </span>
  );
}
