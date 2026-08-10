'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AutoTextarea } from './editor/AutoTextarea';
import { BlockField } from './editor/BlockField';
import { HelpHint } from './editor/HelpHint';
import { SelectionToolbar } from './editor/SelectionToolbar';
import { SettingsPanel } from './editor/SettingsPanel';
import type { UsedImage } from './editor/PhotoPicker';
import type { EditorArticle } from './editor/draft';
import { useBlockFocus } from './editor/useBlockFocus';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n/provider';
import { adminRoutes, apiRoutes } from '@/lib/routes';
import { bodyToPlainText, readingMinutes } from '@/lib/articles/body';
import {
  backspaceInBlock,
  backspaceInListItem,
  convertBlock,
  enterInBlock,
  enterInListItem,
  insertAfter,
  setAttribution,
  setImage,
  setListItem,
  setText,
  toBody,
  toEditorBlocks,
  type BlocksChange,
  type EditorBlock,
  type EditorBlockType,
} from '@/lib/articles/editor-blocks';
import { applyLink, toggleMark, type InlineMark } from '@/lib/articles/inline-marks';
import { formatRelativeTime } from '@/lib/dates';
import { publishBlockers } from '@/lib/validation/article';
import { cn, slugify } from '@/lib/utils';

/**
 * Si scrive in un foglio: 1,2 s di silenzio e la bozza è salvata. Trenta
 * secondi erano giusti per un modulo, non per un foglio.
 */
const AUTOSAVE_MS = 1_200;

export type { EditorArticle };

/**
 * Editor articolo a blocchi (mockup 3a).
 *
 * Non c'è più un testo con i marcatori da convertire, né un'anteprima di
 * fianco: si modificano direttamente i `BodyBlock[]` che il database salva, e
 * i corpi tipografici sono quelli di `ArticleBody`, quindi la colonna di
 * scrittura **è** l'anteprima.
 *
 * Tutto quello che si può sbagliare in silenzio — Invio, Backspace, l'ordine
 * delle chiavi al salvataggio — sta in `lib/articles/editor-blocks.ts`, sotto
 * test. Qui restano lo stato, il salvataggio e il disegno.
 */
export function ArticleEditor({
  article,
  usedImages,
}: {
  article: EditorArticle;
  /** Le foto già presenti negli altri articoli: si riusano invece di ricaricarle. */
  usedImages: UsedImage[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const uid = useId();

  const [draft, setDraft] = useState<EditorArticle>(article);
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => toEditorBlocks(article.body));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date(article.updatedAt));
  const [now, setNow] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [publishAttempted, setPublishAttempted] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [used, setUsed] = useState<UsedImage[]>(usedImages);
  const [slugTouched, setSlugTouched] = useState(Boolean(article.slug && article.title));

  const nextId = useRef(blocks.length);
  const { register, getField, request } = useBlockFocus();

  const body = useMemo(() => toBody(blocks), [blocks]);
  const missing = publishBlockers(draft);

  /* --- "Salvato N minuti fa" ---------------------------------------------
     L'orologio parte solo dopo l'idratazione: calcolarlo durante il rendering
     sul server darebbe un valore diverso da quello del browser. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura dell'ora locale dopo l'idratazione
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const update = useCallback((patch: Partial<EditorArticle>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setDirty(true);
  }, []);

  /**
   * Modifiche al contenuto, una battuta alla volta.
   *
   * Forma funzionale e non `setBlocks(nuovo)`: chi scrive veloce può produrre
   * due battute prima che React abbia riportato lo stato nel componente, e
   * partire da una lista vecchia farebbe sparire il carattere in mezzo.
   */
  const editBlocks = useCallback((edit: (current: EditorBlock[]) => EditorBlock[]) => {
    setBlocks(edit);
    setDirty(true);
  }, []);

  /** Modifiche alla struttura: si portano dietro anche il cursore. */
  const applyChange = useCallback(
    (change: BlocksChange) => {
      setBlocks(change.blocks);
      request(change.focus);
      setDirty(true);
    },
    [request],
  );

  /** Una foto appena scelta entra subito fra quelle riusabili, senza ricaricare. */
  const remember = useCallback((src: string, label: string) => {
    setUsed((current) =>
      current.some((image) => image.src === src) ? current : [{ src, label }, ...current],
    );
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
        body,
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
          const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(errorBody?.error ?? 'Salvataggio non riuscito.');
          return false;
        }

        const saved = (await response.json()) as {
          slug: string;
          status: 'draft' | 'published';
          updatedAt: string;
          publishedAt: string | null;
        };

        const moved = saved.slug !== draft.slug || saved.status !== draft.status;

        setDraft((current) => ({
          ...current,
          slug: saved.slug,
          status: saved.status,
          publishedAt: saved.publishedAt ? saved.publishedAt.slice(0, 10) : current.publishedAt,
        }));
        setLastSavedAt(new Date(saved.updatedAt));
        setDirty(false);
        // A 1,2 s di attesa il salvataggio è frequente: la lista si rilegge solo
        // quando è cambiato qualcosa che la lista mostra davvero.
        if (moved) router.refresh();
        return true;
      } catch {
        setError('Salvataggio non riuscito.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [draft, body, router],
  );

  /* --- Autosalvataggio 1,2 s dopo l'ultimo tasto ------------------------- */
  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => void save(), AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [dirty, save]);

  /* --- Uscire senza perdere niente ----------------------------------------
     `beforeunload` copre solo chiusura e ricaricamento: non scatta sulle
     navigazioni interne, ed è per questo che il ritorno all'elenco salva da sé. */
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onBlur = () => void save();
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [dirty, save]);

  async function leave() {
    if (dirty) await save();
    router.push(adminRoutes.news);
  }

  /* --- Tastiera ----------------------------------------------------------- */
  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const field = event.target as HTMLTextAreaElement;

    if (event.key === 'Enter') {
      const change = enterInBlock(blocks, index, `n${nextId.current}`, event.shiftKey);
      if (!change) return; // Maiusc+Invio, o citazione: va a capo dentro il blocco.
      event.preventDefault();
      nextId.current += 1;
      applyChange(change);
      return;
    }

    if (event.key === 'Backspace') {
      const change = backspaceInBlock(blocks, index, field.value === '');
      if (!change) return;
      event.preventDefault();
      applyChange(change);
    }
  }

  function onListKeyDown(event: React.KeyboardEvent, index: number, item: number) {
    const field = event.target as HTMLInputElement;

    if (event.key === 'Enter') {
      event.preventDefault();
      const change = enterInListItem(blocks, index, item);
      if (change) applyChange(change);
      return;
    }

    if (event.key === 'Backspace') {
      const change = backspaceInListItem(blocks, index, item, field.value === '');
      if (!change) return;
      event.preventDefault();
      applyChange(change);
    }
  }

  function addBlock(index: number, type: EditorBlockType) {
    const change = insertAfter(blocks, index, type, `n${nextId.current}`);
    nextId.current += 1;
    applyChange(change);
  }

  /* --- Barra di formattazione sulla selezione ----------------------------- */
  function readSelection(index: number) {
    const block = blocks[index];
    const field = getField(block.id);
    setSelected(field && field.selectionStart !== field.selectionEnd ? index : null);
  }

  function withSelection(run: (field: HTMLTextAreaElement, index: number) => void) {
    if (selected === null) return;
    const block = blocks[selected];
    const field = getField(block.id);
    if (field instanceof HTMLTextAreaElement) run(field, selected);
  }

  function onMark(mark: InlineMark) {
    withSelection((field, index) => {
      const result = toggleMark(field.value, field.selectionStart, field.selectionEnd, mark);
      editBlocks((current) => setText(current, index, result.value));
      // Il testo cambia lunghezza: la selezione va rimessa dove è finita.
      requestAnimationFrame(() => {
        field.focus();
        field.setSelectionRange(result.start, result.end);
      });
    });
  }

  function onLinkApply(href: string) {
    withSelection((field, index) => {
      const result = applyLink(field.value, field.selectionStart, field.selectionEnd, href);
      editBlocks((current) => setText(current, index, result.value));
      requestAnimationFrame(() => {
        field.focus();
        field.setSelectionRange(result.start, result.end);
      });
    });
    setSelected(null);
  }

  function onConvert(type: EditorBlockType) {
    if (selected === null) return;
    applyChange(convertBlock(blocks, selected, type));
    setSelected(null);
  }

  /* --- Pubblicazione ------------------------------------------------------ */
  function tryPublish() {
    if (missing.length === 0) {
      setPublishAttempted(false);
      void save('published');
      return;
    }
    // Il pulsante resta acceso: non è un errore di chi scrive, è una cosa da
    // finire, e spegnerlo lascerebbe senza sapere cosa manca.
    setPublishAttempted(true);
    setPanelOpen(true);
  }

  const showMissing = publishAttempted && missing.length > 0;

  const words = useMemo(() => {
    const testo = bodyToPlainText(body).trim();
    return testo ? testo.split(/\s+/).length : 0;
  }, [body]);

  const checks = [
    { label: t.admin.editor.checklist.title, done: !missing.includes('titolo') },
    { label: t.admin.editor.checklist.excerpt, done: !missing.includes('sommario') },
    { label: t.admin.editor.checklist.category, done: !missing.includes('categoria') },
    { label: t.admin.editor.checklist.cover, done: !missing.includes('copertina') },
  ];

  const savedLabel = saving
    ? t.admin.editor.saving
    : dirty
      ? t.admin.editor.unsaved
      : now
        ? t.admin.editor.savedAgo.replace('{time}', formatRelativeTime(lastSavedAt, now, 'it'))
        : null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* --- Topbar --------------------------------------------------------- */}
      <header className="flex flex-wrap items-center justify-between gap-14 border-b border-hairline bg-admin-bg px-26 py-14">
        <div className="flex min-w-0 items-center gap-14 font-body text-13">
          <button
            type="button"
            onClick={() => void leave()}
            disabled={saving}
            className="flex-none text-ink-3 transition-colors duration-200 ease-out hover:text-gold disabled:opacity-60"
          >
            ← {t.admin.editor.back}
          </button>
          <span aria-hidden="true" className="block h-16 w-1 flex-none bg-rule-step" />
          <span className={cn('max-w-420 truncate', draft.title ? 'text-ink-2' : 'text-ink-4')}>
            {draft.title || t.admin.editor.newArticle}
          </span>
          <StatusBadge
            status={draft.status}
            label={
              draft.status === 'draft' ? t.admin.news.status.draft : t.admin.news.status.published
            }
          />
          <HelpHint
            label={draft.status === 'draft' ? t.admin.news.status.draft : t.admin.news.status.published}
            align="left"
          >
            {t.admin.editor.help.status}
          </HelpHint>
        </div>

        <div className="flex flex-none items-center gap-12 font-body text-12-5 tracking-08">
          <span className="text-ink-4">{savedLabel}</span>

          <Button
            variant={panelOpen ? 'ghostGold' : 'ghostSoft'}
            size="adminSm"
            aria-expanded={panelOpen}
            className={panelOpen ? 'bg-gold-rail' : undefined}
            onClick={() => setPanelOpen((current) => !current)}
          >
            {t.admin.editor.settings}
          </Button>

          <Button
            variant="ghostSoft"
            size="adminSm"
            onClick={() => void save('draft')}
            disabled={saving}
          >
            {t.admin.editor.saveDraft}
          </Button>

          {draft.status === 'published' ? (
            <Button
              variant="ghostGold"
              size="adminSm"
              onClick={() => void save('draft')}
              disabled={saving}
            >
              {t.admin.editor.unpublish}
            </Button>
          ) : (
            <Button variant="gold" size="adminSm" onClick={tryPublish} disabled={saving}>
              {t.admin.editor.publish}
            </Button>
          )}
        </div>
      </header>

      {/* Rosso solo per gli errori veri: il salvataggio fallito è uno di quelli. */}
      {error && (
        <p
          role="alert"
          className="border-b border-red bg-panel-ime px-26 py-12 font-body text-13 text-red"
        >
          {error}
        </p>
      )}

      {showMissing && (
        <p
          role="status"
          className="flex items-center gap-14 border-b border-gold/40 bg-gold-rail px-26 py-12 font-body text-13 font-medium text-gold"
        >
          <span>{t.admin.editor.publishNotice.replace('{fields}', missing.join(', '))}</span>
          <button
            type="button"
            onClick={() => setPublishAttempted(false)}
            className="ml-auto text-ink-3 transition-colors duration-200 ease-out hover:text-gold"
          >
            <span aria-hidden="true">✕</span>
            <span className="sr-only">{t.admin.editor.dismissNotice}</span>
          </button>
        </p>
      )}

      {/* Sotto i 900px si legge e si correggono i refusi; si scrive da una
          scrivania. Avvisare e lasciar fare, non sbarrare la porta. */}
      <p className="border-b border-hairline bg-panel-ime px-26 py-12 font-body text-12-5 text-ink-3 md:hidden">
        {t.admin.editor.smallScreen}
      </p>

      <div className="flex flex-1 items-stretch">
        {/* --- Colonna di scrittura ---------------------------------------- */}
        <div className="min-w-0 flex-1 px-56 pt-64 pb-90 md:px-124">
          <div className="mx-auto w-full max-w-740">
            <div className="relative">
              <MarginLabel top="top-12" missing={showMissing && missing.includes('titolo')}>
                {t.admin.editor.labels.title}
              </MarginLabel>
              <AutoTextarea
                value={draft.title}
                aria-label={t.admin.editor.labels.title}
                placeholder={t.admin.editor.placeholders.title}
                onChange={(event) => {
                  const title = event.target.value;
                  // Finché nessuno ha toccato lo slug a mano, segue il titolo.
                  update(slugTouched ? { title } : { title, slug: slugify(title) });
                }}
                className="font-display text-42 leading-112 font-medium text-ink"
              />
            </div>

            <div className="relative mt-26">
              <MarginLabel top="top-6" missing={showMissing && missing.includes('sommario')}>
                {t.admin.editor.labels.excerpt}
              </MarginLabel>
              <AutoTextarea
                value={draft.excerpt}
                aria-label={t.admin.editor.labels.excerpt}
                placeholder={t.admin.editor.placeholders.excerpt}
                onChange={(event) => update({ excerpt: event.target.value })}
                className="font-body text-20 leading-165 text-ink"
              />
            </div>

            <div aria-hidden="true" className="mt-34 h-1 bg-hairline" />

            {blocks.map((block, index) => (
              <BlockField
                key={block.id}
                block={block}
                index={index}
                register={register}
                used={used}
                onAdd={addBlock}
                onText={(i, text) => editBlocks((current) => setText(current, i, text))}
                onAttribution={(i, value) =>
                  editBlocks((current) => setAttribution(current, i, value))
                }
                onListItem={(i, item, text) =>
                  editBlocks((current) => setListItem(current, i, item, text))
                }
                onImage={(i, patch) => {
                  editBlocks((current) => setImage(current, i, patch));
                  // Una foto appena messa è già riusabile: la si è appena vista.
                  if (patch.src) {
                    remember(patch.src, patch.label ?? (block.type === 'image' ? block.label : ''));
                  }
                }}
                onKeyDown={onKeyDown}
                onListKeyDown={onListKeyDown}
                onSelect={readSelection}
                onLeave={() => setSelected(null)}
                toolbar={
                  selected === index ? (
                    <SelectionToolbar onMark={onMark} onConvert={onConvert} onLink={onLinkApply} />
                  ) : undefined
                }
              />
            ))}
          </div>
        </div>

        {/* --- Pannello Impostazioni ---------------------------------------- */}
        {panelOpen && (
          <>
            <button
              type="button"
              aria-label={t.admin.editor.closeSettings}
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-30 bg-night/80 lg:hidden"
            />
            <SettingsPanel
              uid={uid}
              draft={draft}
              missing={showMissing ? missing : []}
              used={used}
              onChange={(patch) => {
                update(patch);
                if (patch.coverImage) remember(patch.coverImage, patch.coverAlt ?? draft.coverAlt);
              }}
              onSlug={(value) => {
                setSlugTouched(true);
                update({ slug: slugify(value) });
              }}
              onClose={() => setPanelOpen(false)}
            />
          </>
        )}
      </div>

      {/* --- Riga di controllo -------------------------------------------- */}
      <footer className="flex flex-wrap items-center gap-22 border-t border-hairline bg-admin-bg px-26 py-14 font-body text-12-5 font-medium text-ink-4">
        {/* L'aiuto sta in fondo alla pagina, quindi si apre verso l'alto. */}
        <HelpHint label={t.admin.editor.publish} placement="above" align="left">
          {t.admin.editor.help.checklist}
        </HelpHint>
        {checks.map((check) => (
          <span key={check.label} className="flex items-center gap-9">
            {check.done ? (
              <span
                aria-hidden="true"
                className="flex size-14 items-center justify-center rounded-pill bg-gold text-9 font-semibold text-gold-ink"
              >
                ✓
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="block size-14 rounded-pill border border-field-border"
              />
            )}
            {check.label}
          </span>
        ))}
        <span className="ml-auto">
          {words > 0
            ? t.admin.editor.words
                .replace('{words}', String(words))
                .replace('{minutes}', String(readingMinutes(body)))
            : t.admin.editor.noWords}
        </span>
      </footer>
    </div>
  );
}

/**
 * Le etichette dei campi stanno nel margine, non dentro riquadri: dicono cosa
 * si sta scrivendo senza trasformare il foglio in un modulo. Sono decorative —
 * il nome accessibile del campo arriva da `aria-label` — e sotto i 900px, dove
 * il margine non c'è, spariscono.
 */
function MarginLabel({
  top,
  missing,
  children,
}: {
  top: string;
  missing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute -left-104 hidden items-center gap-6 font-body text-9 font-medium tracking-20 md:flex',
        top,
        missing ? 'text-gold' : 'text-ink-4',
      )}
    >
      {missing && <span className="block size-6 rounded-pill bg-gold" />}
      {children}
    </span>
  );
}
