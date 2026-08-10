'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PhotoPicker, type UsedImage } from './PhotoPicker';
import type { EditorArticle } from './draft';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { FieldLabel, Input, Select, Toggle } from '@/components/ui/Field';
import { newsCategories } from '@/data/news-categories';
import { useI18n } from '@/i18n/provider';
import { routes } from '@/lib/routes';
import { seoLimits, site } from '@/lib/site';
import { cn, slugify } from '@/lib/utils';

/**
 * Il pannello delle impostazioni: tutto quello che non è l'articolo.
 *
 * Parte chiuso, perché aprire un articolo per scriverci dentro è il caso
 * normale e la categoria si sceglie una volta sola. Sotto i 1200px si
 * sovrappone alla colonna invece di stringerla: a quelle larghezze 320px tolti
 * al testo sono un terzo della riga.
 */
export type PanelDraft = Pick<
  EditorArticle,
  | 'slug'
  | 'category'
  | 'coverImage'
  | 'coverAlt'
  | 'tags'
  | 'publishedAt'
  | 'featured'
  | 'status'
  | 'title'
  | 'excerpt'
  | 'seoTitle'
  | 'seoDescription'
>;

export function SettingsPanel({
  uid,
  draft,
  missing,
  used,
  onChange,
  onSlug,
  onClose,
}: {
  uid: string;
  draft: PanelDraft;
  /** I campi che mancano per pubblicare, da `publishBlockers`. */
  missing: readonly string[];
  used: UsedImage[];
  onChange: (patch: Partial<PanelDraft>) => void;
  onSlug: (value: string) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  /** Il tag in corso di scrittura non è ancora dell'articolo: vive solo qui. */
  const [newTag, setNewTag] = useState('');

  const slug = draft.slug || slugify(draft.title) || 'nuovo-articolo';
  const seoTitle = draft.seoTitle || draft.title;
  const seoDescription = draft.seoDescription || draft.excerpt;

  const manca = (campo: string) => missing.includes(campo);

  return (
    <aside
      aria-label={t.admin.editor.settings}
      className={cn(
        'fixed inset-y-0 right-0 z-40 w-full overflow-y-auto bg-admin-bg px-24 py-22',
        'border-l border-hairline md:w-320',
        'lg:static lg:z-auto lg:w-320 lg:flex-none lg:overflow-y-visible',
      )}
    >
      <div className="flex items-center justify-between font-body text-10-5 font-medium tracking-20 text-ink-4">
        <span>{t.admin.editor.settingsTitle}</span>
        <button
          type="button"
          onClick={onClose}
          className="text-12 text-ink-3 transition-colors duration-200 ease-out hover:text-gold"
        >
          <span aria-hidden="true">✕</span>
          <span className="sr-only">{t.admin.editor.closeSettings}</span>
        </button>
      </div>

      {/* --- Copertina ----------------------------------------------------- */}
      <div className="mt-20">
        <PanelLabel htmlFor={`${uid}-cover`} missing={manca('copertina')}>
          {t.admin.editor.labels.cover}
        </PanelLabel>

        {draft.coverImage ? (
          <div className="relative">
            <PhotoSlot
              label={draft.coverAlt || t.admin.editor.photo.field}
              src={draft.coverImage}
              alt={draft.coverAlt}
              className="h-130"
              sizes="320px"
            />
            <button
              type="button"
              onClick={() => onChange({ coverImage: null })}
              className="absolute top-8 right-8 border border-field-border bg-admin-bg px-10 py-6 font-body text-12 font-medium text-ink-3 transition-colors duration-200 ease-out hover:border-gold hover:text-gold"
            >
              {t.admin.editor.photo.remove}
            </button>
          </div>
        ) : (
          <PhotoPicker
            id={`${uid}-cover`}
            label={t.admin.editor.labels.cover}
            variant="cover"
            used={used}
            invalid={manca('copertina')}
            onPick={(image) => {
              onChange({ coverImage: image.src });
              if (!draft.coverAlt) onChange({ coverAlt: image.label });
            }}
          />
        )}

        {/* La copertina finisce nell'`alt` della pagina pubblica: se la
            descrizione non sta accanto alla foto, non la scrive nessuno. */}
        <input
          value={draft.coverAlt}
          aria-label={t.admin.editor.labels.coverAlt}
          placeholder={t.admin.editor.photo.alt}
          onChange={(event) => onChange({ coverAlt: event.target.value })}
          className="mt-10 w-full border-0 border-b border-field-border bg-transparent px-0 py-8 font-body text-13 text-ink-2 outline-none placeholder:text-ink-4 focus:border-gold"
        />
      </div>

      {/* --- Categoria ----------------------------------------------------- */}
      <div className="mt-22">
        <PanelLabel htmlFor={`${uid}-category`} missing={manca('categoria')}>
          {t.admin.editor.labels.category}
        </PanelLabel>
        <Select
          id={`${uid}-category`}
          tone="admin"
          value={draft.category}
          onChange={(event) => onChange({ category: event.target.value })}
          className={manca('categoria') ? 'border-gold' : undefined}
        >
          <option value="">{t.forms.placeholders.choose}</option>
          {newsCategories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      {/* --- Data e in evidenza -------------------------------------------- */}
      <div className="mt-16 flex items-end gap-12">
        <div className="min-w-0 flex-1">
          <PanelLabel htmlFor={`${uid}-date`}>{t.admin.editor.labels.date}</PanelLabel>
          <Input
            id={`${uid}-date`}
            tone="admin"
            type="date"
            value={draft.publishedAt}
            onChange={(event) => onChange({ publishedAt: event.target.value })}
          />
        </div>
        <div className="flex-none">
          <PanelLabel htmlFor={`${uid}-featured`}>{t.admin.editor.labels.featured}</PanelLabel>
          <Toggle
            id={`${uid}-featured`}
            checked={draft.featured}
            onChange={(next) => onChange({ featured: next })}
            labelOn={t.admin.editor.featuredYes}
            labelOff={t.admin.editor.featuredNo}
          />
        </div>
      </div>

      {/* --- Tag ------------------------------------------------------------ */}
      <div className="mt-22">
        <PanelLabel htmlFor={`${uid}-tag`}>{t.admin.editor.labels.tags}</PanelLabel>
        <div className="flex flex-wrap items-center gap-8 font-body text-12-5 font-medium text-ink-2">
          {draft.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-8 rounded-pill border border-field-border px-12 py-6"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange({ tags: draft.tags.filter((item) => item !== tag) })}
                className="text-ink-3 transition-colors duration-200 ease-out hover:text-red"
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
              onChange({ tags: [...draft.tags, value] });
              setNewTag('');
            }}
            placeholder={t.admin.editor.addTag}
            className="w-130 bg-transparent py-6 text-ink-4 outline-none placeholder:text-ink-4 focus:text-ink-2"
          />
        </div>
      </div>

      {/* --- Slug ----------------------------------------------------------- */}
      <div className="mt-22">
        <PanelLabel htmlFor={`${uid}-slug`}>{t.admin.editor.labels.slug}</PanelLabel>
        <Input
          id={`${uid}-slug`}
          tone="admin"
          value={draft.slug}
          onChange={(event) => onSlug(event.target.value)}
        />
        {/* L'anteprima separata non c'è più; per l'articolo già online resta
            utile arrivarci in un clic, ma è un dettaglio, non un pulsante. */}
        {draft.status === 'published' && (
          <Link
            href={`/it${routes.article(slug)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-10 block font-body text-12-5 text-ink-3 underline underline-offset-2 transition-colors duration-200 ease-out hover:text-gold"
          >
            {t.admin.editor.viewPage}
          </Link>
        )}
      </div>

      {/* --- SEO ------------------------------------------------------------ */}
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
  );
}

/** Etichetta del pannello: quando il campo manca per pubblicare, passa in oro. */
function PanelLabel({
  htmlFor,
  missing,
  children,
}: {
  htmlFor: string;
  missing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <FieldLabel htmlFor={htmlFor} tone="admin" className={missing ? 'text-gold' : undefined}>
      <span className="inline-flex items-center gap-6">
        {missing && <span aria-hidden="true" className="block size-6 rounded-pill bg-gold" />}
        {children}
      </span>
    </FieldLabel>
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
