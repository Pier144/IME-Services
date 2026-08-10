'use client';

import { useRef, useState } from 'react';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { useI18n } from '@/i18n/provider';
import { apiRoutes } from '@/lib/routes';
import { uploadLimits } from '@/lib/site';
import type { StoredFile } from '@/lib/storage/types';
import { cn, formatFileSize } from '@/lib/utils';
import type { UsedImage } from '@/lib/articles/editor-blocks';

export type { UsedImage };

/**
 * Il punto in cui una foto entra nell'articolo.
 *
 * Due strade, entrambe sul posto: si trascina un file nuovo, oppure si sceglie
 * una foto già usata. La seconda esiste perché senza di lei la stessa immagine
 * finisce nel bucket tre volte — in copertina, nel corpo, e di nuovo l'anno
 * dopo — e nessuno se ne accorge finché non si guarda lo spazio occupato.
 */
export function PhotoPicker({
  id,
  label,
  variant,
  used,
  onPick,
  invalid,
}: {
  id: string;
  /** Nome accessibile del campo file. */
  label: string;
  variant: 'block' | 'cover';
  used: UsedImage[];
  onPick: (image: UsedImage) => void;
  invalid?: boolean;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = uploadLimits.cover;

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setError(null);
    if (file.size > limit.maxBytes) {
      setError(`${t.forms.errors.fileTooBig} (${formatFileSize(limit.maxBytes)})`);
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('kind', 'cover');

      const response = await fetch(apiRoutes.upload, { method: 'POST', body });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? t.forms.errors.uploadFailed);
        return;
      }

      const stored = (await response.json()) as StoredFile;
      onPick({ src: stored.url, label: stored.name });
    } catch {
      setError(t.forms.errors.uploadFailed);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  const dropProps = {
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      void upload(event.dataTransfer.files);
    },
  };

  const bordo = invalid ? 'border-gold' : dragging ? 'border-gold' : 'border-gold-dash';

  return (
    <div>
      <div
        {...dropProps}
        className={cn(
          'rounded-soft border border-dashed text-center transition-colors duration-200 ease-out',
          bordo,
          variant === 'cover' ? 'photo-slot h-130' : 'bg-gold-veil px-20 py-34',
        )}
      >
        {variant === 'block' ? (
          <>
            <p aria-hidden="true" className="font-display text-24 font-medium text-gold">
              ＋
            </p>
            <p className="mt-6 font-body text-14 font-medium text-ink">
              {t.admin.editor.photo.drop}{' '}
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="text-gold underline underline-offset-2 transition-colors duration-200 hover:text-gold-hover"
              >
                {t.common.browse}
              </button>
            </p>
            <p className="mt-4 font-body text-13 font-medium text-ink-3">
              {t.admin.editor.photo.limits.replace('{size}', formatFileSize(limit.maxBytes))}
            </p>
          </>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="photo-slot-label cursor-pointer"
          >
            {t.admin.editor.photo.cover}
          </button>
        )}

        <input
          ref={input}
          id={id}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          aria-label={label}
          className="sr-only"
          onChange={(event) => void upload(event.target.files)}
        />
      </div>

      {busy && (
        <p className="mt-8 font-body text-12 font-medium text-ink-3">{t.forms.dropzone.uploading}</p>
      )}
      {error && (
        <p role="alert" className="mt-8 font-body text-12 text-red">
          {error}
        </p>
      )}

      {used.length > 0 && (
        <div className="mt-10">
          <p className="font-body text-12 font-medium text-ink-4">{t.admin.editor.photo.reuse}</p>
          <ul className="mt-8 flex flex-wrap gap-8">
            {used.map((image) => (
              <li key={image.src}>
                <button
                  type="button"
                  title={image.label}
                  onClick={() => onPick(image)}
                  className="block overflow-hidden rounded-soft border border-field-border transition-colors duration-200 ease-out hover:border-gold"
                >
                  <PhotoSlot
                    label={image.label}
                    src={image.src}
                    alt={image.label}
                    className="size-44"
                    labelClassName="sr-only"
                    sizes="44px"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
