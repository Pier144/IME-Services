'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArticlePreview } from './ArticlePreview';
import { EditorToolbar } from './EditorToolbar';
import { Dropzone } from '@/components/forms/Dropzone';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FieldLabel, Input, Select, Textarea, Toggle } from '@/components/ui/Field';
import { useI18n } from '@/i18n/provider';
import { localePath } from '@/i18n/config';
import { adminRoutes, apiRoutes, routes } from '@/lib/routes';
import { newsCategories } from '@/data/news-categories';
import { textToBlocks } from '@/lib/articles/body';
import { formatRelativeTime } from '@/lib/dates';
import { publishBlockers } from '@/lib/validation/article';
import type { StoredFile } from '@/lib/storage/types';
import { seoLimits, site } from '@/lib/site';
import { cn, slugify } from '@/lib/utils';

const AUTOSAVE_MS = 30_000;
const PREVIEW_DEBOUNCE_MS = 200;

export type EditorArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyText: string;
  category: string;
  coverImage: string | null;
  coverAlt: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
};

/**
 * Editor articolo con anteprima live (mockup 2j).
 *
 * - l'anteprima si ricalcola 200 ms dopo l'ultimo tasto, con gli stessi
 *   componenti della pagina pubblica;
 * - la bozza si salva da sola ogni 30 secondi, ma solo se qualcosa è cambiato,
 *   e il timestamp mostrato è quello vero della risposta del server;
 * - PUBBLICA resta spento finché mancano titolo, categoria, copertina o
 *   sommario. Lo stesso controllo gira anche lato server.
 */
export function ArticleEditor({ article }: { article: EditorArticle }) {
  const { t } = useI18n();
  const router = useRouter();
  const uid = useId();
  const textarea = useRef<HTMLTextAreaElement>(null);

  const [draft, setDraft] = useState<EditorArticle>(article);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date(article.updatedAt));
  const [now, setNow] = useState<Date | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [slugTouched, setSlugTouched] = useState(Boolean(article.slug && article.title));

  /* --- Anteprima: ricalcolo con attesa di 200 ms ------------------------ */
  const [previewText, setPreviewText] = useState(article.bodyText);
  useEffect(() => {
    const timer = window.setTimeout(() => setPreviewText(draft.bodyText), PREVIEW_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft.bodyText]);
  const previewBlocks = useMemo(() => textToBlocks(previewText), [previewText]);

  /* --- "Salvato N minuti fa" ---------------------------------------------
     L'orologio parte solo dopo l'idratazione: calcolarlo durante il rendering
     sul server darebbe un valore diverso da quello del browser. È una scrittura
     di stato voluta e non ricorsiva, quindi la regola qui non si applica. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura dell'ora locale dopo l'idratazione
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const update = useCallback(<K extends keyof EditorArticle>(key: K, value: EditorArticle[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }, []);

  /* --- Salvataggio ------------------------------------------------------- */
  const save = useCallback(
    async (status?: 'draft' | 'published') => {
      setSaving(true);
      setError(null);

      const payload = {
        title: draft.title,
        slug: draft.slug || slugify(draft.title),
        excerpt: draft.excerpt,
        bodyText: draft.bodyText,
        category: draft.category,
        coverImage: draft.coverImage,
        coverAlt: draft.coverAlt,
        tags: draft.tags,
        status: status ?? draft.status,
        featured: draft.featured,
        publishedAt: draft.publishedAt || null,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
      };

      try {
        const response = await fetch(apiRoutes.article(draft.id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(body?.error ?? 'Salvataggio non riuscito.');
          return false;
        }

        const saved = (await response.json()) as {
          slug: string;
          status: 'draft' | 'published';
          updatedAt: string;
          publishedAt: string | null;
        };

        setDraft((current) => ({
          ...current,
          slug: saved.slug,
          status: saved.status,
          publishedAt: saved.publishedAt ? saved.publishedAt.slice(0, 10) : current.publishedAt,
        }));
        setLastSavedAt(new Date(saved.updatedAt));
        setDirty(false);
        router.refresh();
        return true;
      } catch {
        setError('Salvataggio non riuscito.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [draft, router],
  );

  /* --- Autosalvataggio ogni 30 s, solo se c'è qualcosa da salvare -------- */
  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => void save(), AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [dirty, save]);

  /* --- Uscire senza perdere niente ----------------------------------------
     Tre modi di lasciare l'editor, tre reti diverse. `beforeunload` copre solo
     chiusura e ricaricamento: non scatta sulle navigazioni interne, ed è per
     questo che il ritorno all'elenco salva da sé (vedi la topbar). */
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  /* Cambio di finestra o di scheda: si salva subito, senza aspettare i 30 s. */
  useEffect(() => {
    if (!dirty) return;
    const onBlur = () => void save();
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [dirty, save]);

  /** Ritorno all'elenco: prima si salva, poi si naviga. */
  async function leave() {
    if (dirty) await save();
    router.push(adminRoutes.news);
  }

  const missing = publishBlockers(draft);
  const canPublish = missing.length === 0;

  const seoTitle = draft.seoTitle || draft.title;
  const seoDescription = draft.seoDescription || draft.excerpt;
  const slug = draft.slug || slugify(draft.title) || 'nuovo-articolo';

  const coverFiles: StoredFile[] = draft.coverImage
    ? [
        {
          name: draft.coverAlt || 'copertina',
          size: 0,
          mimeType: 'image/*',
          key: draft.coverImage,
          url: draft.coverImage,
          uploadedAt: draft.updatedAt,
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      {/* --- Topbar --------------------------------------------------------- */}
      <header className="flex flex-col gap-14 border-b border-hairline bg-admin-bg px-24 py-14 lg:flex-row lg:items-center lg:justify-between lg:px-26">
        <div className="flex flex-wrap items-center gap-14 font-body text-13">
          <button
            type="button"
            onClick={() => void leave()}
            disabled={saving}
            className="text-ink-3 transition-colors duration-200 hover:text-gold disabled:opacity-60"
          >
            ← {t.admin.editor.back}
          </button>
          <span aria-hidden="true" className="hidden h-16 w-1 bg-rule-step lg:block" />
          <span className="max-w-360 truncate">{draft.title || t.admin.editor.newArticle}</span>
          <StatusBadge
            status={draft.status}
            label={draft.status === 'draft' ? t.admin.news.status.draft : t.admin.news.status.published}
          />
          {/* Il colore da solo non dice cosa comporta essere una bozza. */}
          {draft.status === 'draft' && (
            <span className="text-ink-4">{t.admin.editor.draftHint}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-12 font-body text-12-5 tracking-08">
          <span className="text-ink-4">
            {saving
              ? t.admin.editor.saving
              : dirty
                ? t.admin.editor.unsaved
                : now
                  ? t.admin.editor.savedAgo.replace('{time}', formatRelativeTime(lastSavedAt, now, 'it'))
                  : null}
          </span>

          {draft.status === 'published' ? (
            <Link
              href={localePath('it', routes.article(slug))}
              target="_blank"
              rel="noreferrer"
              className="border border-ghost-soft px-18 py-9 text-ink transition-colors duration-200 hover:border-ghost"
            >
              {t.admin.editor.preview}
            </Link>
          ) : (
            <Button variant="ghostSoft" size="adminSm" disabled>
              {t.admin.editor.preview}
            </Button>
          )}

          <Button variant="ghostSoft" size="adminSm" onClick={() => void save('draft')} disabled={saving}>
            {t.admin.editor.saveDraft}
          </Button>

          {draft.status === 'published' ? (
            <Button variant="ghostGold" size="adminSm" onClick={() => void save('draft')} disabled={saving}>
              {t.admin.editor.unpublish}
            </Button>
          ) : (
            <Button
              variant="gold"
              size="adminSm"
              onClick={() => void save('published')}
              disabled={saving || !canPublish}
              title={canPublish ? undefined : t.admin.editor.publishBlocked}
            >
              {t.admin.editor.publish}
            </Button>
          )}
        </div>
      </header>

      {error && (
        <p role="alert" className="border-b border-red bg-panel-ime px-24 py-12 font-body text-13 text-red">
          {error}
        </p>
      )}
      {!canPublish && (
        <p className="border-b border-hairline px-24 py-10 font-body text-12-5 font-medium text-ink-4">
          {/* Non "manca qualcosa": manca *questo*. L'elenco lo sa già publishBlockers. */}
          {t.admin.editor.publishMissing.replace('{fields}', missing.join(', '))}
        </p>
      )}

      <div className="flex flex-1 flex-col items-stretch lg:flex-row">
        {/* --- Colonna editor ---------------------------------------------- */}
        <div className="min-w-0 flex-1 border-hairline px-24 py-24 lg:px-34 lg:py-30 lg:border-r">
          <FieldLabel htmlFor={`${uid}-title`} tone="admin">
            {t.admin.editor.labels.title}
          </FieldLabel>
          <input
            id={`${uid}-title`}
            value={draft.title}
            onChange={(event) => {
              update('title', event.target.value);
              if (!slugTouched) update('slug', slugify(event.target.value));
            }}
            className="w-full border border-field-border bg-field-bg px-16 py-14 font-display text-22 font-medium text-ink outline-none focus:border-gold"
          />

          <div className="mt-20 flex flex-col gap-16 md:flex-row">
            <div className="flex-1">
              <FieldLabel htmlFor={`${uid}-category`} tone="admin">
                {t.admin.editor.labels.category}
              </FieldLabel>
              <Select
                id={`${uid}-category`}
                tone="admin"
                value={draft.category}
                onChange={(event) => update('category', event.target.value)}
              >
                <option value="">{t.forms.placeholders.choose}</option>
                {newsCategories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex-1">
              <FieldLabel htmlFor={`${uid}-date`} tone="admin">
                {t.admin.editor.labels.date}
              </FieldLabel>
              <Input
                id={`${uid}-date`}
                tone="admin"
                type="date"
                value={draft.publishedAt}
                onChange={(event) => update('publishedAt', event.target.value)}
              />
            </div>

            <div className="flex-none md:w-130">
              <FieldLabel htmlFor={`${uid}-featured`} tone="admin">
                {t.admin.editor.labels.featured}
              </FieldLabel>
              <Toggle
                id={`${uid}-featured`}
                checked={draft.featured}
                onChange={(next) => update('featured', next)}
                labelOn={t.admin.editor.featuredYes}
                labelOff={t.admin.editor.featuredNo}
              />
            </div>
          </div>

          {/* Copertina */}
          <div className="mt-20">
            <FieldLabel htmlFor={`${uid}-cover`} tone="admin">
              {t.admin.editor.labels.cover}
            </FieldLabel>
            <div className="flex flex-col items-stretch gap-12 sm:flex-row">
              <PhotoSlot
                label={draft.coverAlt || 'copertina'}
                src={draft.coverImage}
                alt={draft.coverAlt}
                className="h-110 flex-none sm:w-190"
                labelClassName="text-9"
                sizes="190px"
              />
              <div className="flex-1">
                <Dropzone
                  id={`${uid}-cover`}
                  kind="cover"
                  label={t.admin.editor.labels.cover}
                  compact
                  files={coverFiles}
                  onChange={(files) => {
                    const file = files[files.length - 1] ?? null;
                    update('coverImage', file ? file.url : null);
                    if (file && !draft.coverAlt) update('coverAlt', file.name);
                  }}
                />
              </div>
            </div>

            <div className="mt-12">
              <FieldLabel htmlFor={`${uid}-cover-alt`} tone="admin">
                {t.admin.editor.labels.coverAlt}
              </FieldLabel>
              <Input
                id={`${uid}-cover-alt`}
                tone="admin"
                value={draft.coverAlt}
                onChange={(event) => update('coverAlt', event.target.value)}
              />
            </div>
          </div>

          {/* Sommario */}
          <div className="mt-20">
            <FieldLabel htmlFor={`${uid}-excerpt`} tone="admin">
              {t.admin.editor.labels.excerpt}
            </FieldLabel>
            <Textarea
              id={`${uid}-excerpt`}
              tone="admin"
              className="h-76"
              value={draft.excerpt}
              onChange={(event) => update('excerpt', event.target.value)}
            />
          </div>

          {/* Testo */}
          <div className="mt-20">
            <FieldLabel htmlFor={`${uid}-body`} tone="admin">
              {t.admin.editor.labels.body}
            </FieldLabel>
            <div className="border border-field-border">
              <EditorToolbar textarea={textarea} onChange={(next) => update('bodyText', next)} />
              <textarea
                id={`${uid}-body`}
                ref={textarea}
                value={draft.bodyText}
                onChange={(event) => update('bodyText', event.target.value)}
                placeholder={t.admin.editor.bodyPlaceholder}
                className="h-200 w-full resize-y bg-field-bg px-16 py-16 font-body text-15 leading-185 font-medium text-ink-2 outline-none placeholder:text-ink-4"
              />
            </div>
          </div>

          {/* Tag */}
          <div className="mt-20">
            <FieldLabel htmlFor={`${uid}-tag`} tone="admin">
              {t.admin.editor.labels.tags}
            </FieldLabel>
            <div className="flex flex-wrap items-center gap-8 font-body text-12-5 font-medium text-ink-2">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-8 rounded-pill border border-field-border px-12 py-6"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => update('tags', draft.tags.filter((item) => item !== tag))}
                    className="text-ink-3 transition-colors duration-200 hover:text-red"
                  >
                    <span aria-hidden="true">✕</span>
                    <span className="sr-only">
                      {t.common.remove} {tag}
                    </span>
                  </button>
                </span>
              ))}
              <input
                id={`${uid}-tag`}
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  const value = newTag.trim();
                  if (!value || draft.tags.includes(value)) return;
                  update('tags', [...draft.tags, value]);
                  setNewTag('');
                }}
                placeholder={t.admin.editor.addTag}
                className="w-160 bg-transparent py-6 text-ink-4 outline-none placeholder:text-ink-4 focus:text-ink-2"
              />
            </div>
          </div>

          {/* Slug */}
          <div className="mt-20">
            <FieldLabel htmlFor={`${uid}-slug`} tone="admin">
              {t.admin.editor.labels.slug}
            </FieldLabel>
            <Input
              id={`${uid}-slug`}
              tone="admin"
              value={draft.slug}
              onChange={(event) => {
                setSlugTouched(true);
                update('slug', slugify(event.target.value));
              }}
            />
          </div>
        </div>

        {/* --- Colonna anteprima ------------------------------------------- */}
        <aside className="flex-none bg-admin-bg px-24 py-22 lg:w-430">
          <div className="flex items-center justify-between font-body text-10-5 font-medium tracking-20 text-ink-4">
            <span>{t.admin.editor.previewTitle}</span>
            <span className="flex items-center gap-8">
              {(['desktop', 'mobile'] as const).map((value, index) => (
                <span key={value} className="flex items-center gap-8">
                  {index > 0 && <span aria-hidden="true">·</span>}
                  <button
                    type="button"
                    onClick={() => setDevice(value)}
                    aria-pressed={device === value}
                    className={cn(
                      'transition-colors duration-200',
                      device === value ? 'text-gold' : 'text-ink-4 hover:text-gold',
                    )}
                  >
                    {value === 'desktop' ? t.admin.editor.desktop : t.admin.editor.mobile}
                  </button>
                </span>
              ))}
            </span>
          </div>

          <div className="mt-12">
            <ArticlePreview
              title={draft.title}
              excerpt={draft.excerpt}
              category={draft.category}
              coverImage={draft.coverImage}
              coverAlt={draft.coverAlt}
              date={draft.publishedAt ? new Date(`${draft.publishedAt}T12:00:00Z`) : new Date()}
              blocks={previewBlocks}
              device={device}
              placeholderTitle={t.admin.editor.newArticle}
            />
          </div>

          {/* SEO */}
          <div className="mt-22 border-t border-hairline-strong pt-18">
            <p className="font-body text-10-5 font-medium tracking-20 text-ink-4">
              {t.admin.editor.seo}
            </p>

            <SeoCounter
              label={t.admin.editor.seoTitle}
              value={seoTitle.length}
              limit={seoLimits.title}
              unit={t.admin.editor.characters}
            />
            <SeoCounter
              label={t.admin.editor.seoDescription}
              value={seoDescription.length}
              limit={seoLimits.description}
              unit={t.admin.editor.characters}
            />

            <p className="mt-12 font-body text-13 leading-170 font-medium text-ink-3">
              {t.admin.editor.url}
              <br />
              <span className="text-ink-2">
                {site.url.replace(/^https?:\/\//, '')}
                {routes.news}/<span className="text-gold">{slug}</span>
              </span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Contatore SEO con barra: oltre il limite passa in rosso. */
function SeoCounter({
  label,
  value,
  limit,
  unit,
}: {
  label: string;
  value: number;
  limit: number;
  unit: string;
}) {
  const over = value > limit;
  const width = Math.min(100, Math.round((value / limit) * 100));

  return (
    <div className="mt-12 font-body text-13 leading-170 font-medium text-ink-3">
      {label} ·{' '}
      <span className={over ? 'text-red' : undefined}>
        {value}/{limit}
      </span>{' '}
      {unit}
      <span className="mt-6 block h-4 bg-track">
        <span
          className={cn('block h-full transition-[width] duration-200', over ? 'bg-red' : 'bg-gold')}
          style={{ width: `${width}%` }}
        />
      </span>
    </div>
  );
}
