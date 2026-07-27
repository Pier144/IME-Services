'use client';

import { useRef, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { apiRoutes } from '@/lib/routes';
import type { StoredFile } from '@/lib/storage/types';
import { uploadLimits } from '@/lib/site';
import { cn, formatFileSize } from '@/lib/utils';

export type UploadKind = 'attachment' | 'cv' | 'cover';

const accept: Record<UploadKind, string> = {
  attachment: '.jpg,.jpeg,.png,.pdf,.ai,.dwg',
  cv: '.pdf,.doc,.docx',
  cover: '.jpg,.jpeg,.png,.webp',
};

/**
 * Area di caricamento: trascinamento o selezione classica.
 *
 * Il file parte subito verso `/api/upload`, che lo valida di nuovo lato server
 * (dimensione e formato) prima di scriverlo. Al form resta solo il riferimento
 * al file salvato, quindi l'invio finale è un JSON leggero.
 */
export function Dropzone({
  id,
  kind,
  label,
  files,
  onChange,
  multiple = false,
  compact = false,
  describedBy,
  invalid,
}: {
  id: string;
  kind: UploadKind;
  /** Nome accessibile del campo file: l'etichetta visibile è un titolo a parte. */
  label: string;
  files: StoredFile[];
  onChange: (files: StoredFile[]) => void;
  multiple?: boolean;
  compact?: boolean;
  describedBy?: string;
  invalid?: boolean;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = kind === 'cv' ? uploadLimits.cv : kind === 'cover' ? uploadLimits.cover : uploadLimits.attachment;

  async function upload(list: FileList | File[]) {
    setError(null);
    const incoming = Array.from(list).slice(0, multiple ? 10 : 1);
    if (incoming.length === 0) return;

    for (const file of incoming) {
      if (file.size > limit.maxBytes) {
        setError(`${t.forms.errors.fileTooBig} (${formatFileSize(limit.maxBytes)})`);
        return;
      }
    }

    setBusy(true);
    try {
      const uploaded: StoredFile[] = [];
      for (const file of incoming) {
        const body = new FormData();
        body.append('file', file);
        body.append('kind', kind);

        const response = await fetch(apiRoutes.upload, { method: 'POST', body });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(payload?.error ?? t.forms.errors.uploadFailed);
          return;
        }
        uploaded.push((await response.json()) as StoredFile);
      }
      onChange(multiple ? [...files, ...uploaded] : uploaded);
    } catch {
      setError(t.forms.errors.uploadFailed);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload(event.dataTransfer.files);
        }}
        className={cn(
          'border border-dashed text-center transition-colors duration-200 ease-out',
          compact ? 'px-20 py-20' : 'px-20 py-26',
          invalid ? 'border-red' : dragging ? 'border-gold' : 'border-gold-dash',
          'bg-gold-veil',
        )}
      >
        {!compact && (
          <p aria-hidden="true" className="font-display text-24 font-medium text-gold">
            ＋
          </p>
        )}
        <p className={cn('font-body text-14 font-medium text-ink', !compact && 'mt-6')}>
          {kind === 'cv' ? t.forms.dropzone.titleCv : t.forms.dropzone.title}{' '}
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="text-gold underline underline-offset-2 transition-colors duration-200 hover:text-gold-hover"
          >
            {t.common.browse}
          </button>
        </p>
        <p className="mt-4 font-body text-13 font-medium text-ink-3">
          {kind === 'cv' ? t.forms.dropzone.hintCv : t.forms.dropzone.hintAttachment}
        </p>

        <input
          ref={input}
          id={id}
          type="file"
          accept={accept[kind]}
          multiple={multiple}
          aria-label={label}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className="sr-only"
          onChange={(event) => event.target.files && void upload(event.target.files)}
        />
      </div>

      {busy && (
        <p className="mt-10 font-body text-12 font-medium text-ink-3">{t.forms.dropzone.uploading}</p>
      )}
      {error && (
        <p role="alert" className="mt-10 font-body text-12 text-red">
          {error}
        </p>
      )}

      <ul>
        {files.map((file) => (
          <li
            key={file.key}
            className="mt-10 flex items-center justify-between gap-14 border border-rule-toolbar px-14 py-10 font-body text-14 font-medium text-ink-2"
          >
            <span className="truncate">
              {file.name} · {formatFileSize(file.size)}
            </span>
            <button
              type="button"
              onClick={() => onChange(files.filter((item) => item.key !== file.key))}
              className="flex-none text-ink-3 transition-colors duration-200 hover:text-red"
            >
              <span aria-hidden="true">✕</span>
              <span className="sr-only">
                {t.forms.dropzone.remove}: {file.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
