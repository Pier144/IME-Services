'use client';

import { useState } from 'react';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { useI18n } from '@/i18n/provider';
import type { GalleryShot } from '@/data/subjects';
import { cn } from '@/lib/utils';

/**
 * Galleria della scheda soggetto: foto principale 440px e quattro miniature da
 * 92px. La miniatura selezionata ha un filetto oro all'interno
 * (`inset 0 0 0 1px`), non un'ombra.
 */
export function SubjectGallery({ shots, name }: { shots: readonly GalleryShot[]; name: string }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const active = shots[index] ?? shots[0];

  if (!active) return null;

  return (
    <div>
      <PhotoSlot
        label={active.photo}
        src={active.src}
        alt={`${name} · ${active.caption}`}
        className="h-260 md:h-340 lg:h-440"
        sizes="(max-width: 1200px) 100vw, 700px"
        priority
      />

      {shots.length > 1 && (
        <div role="group" aria-label={t.subject.galleryLabel} className="mt-12 flex gap-12">
          {shots.map((shot, shotIndex) => (
            <button
              key={shot.caption}
              type="button"
              onClick={() => setIndex(shotIndex)}
              aria-pressed={shotIndex === index}
              className={cn(
                'h-64 flex-1 md:h-92',
                shotIndex === index && 'shadow-thumb-active',
              )}
            >
              <span className="sr-only">
                {t.subject.galleryThumb} {shot.caption}
              </span>
              <PhotoSlot
                label={shot.caption}
                src={shot.src}
                alt=""
                className="h-full w-full"
                sizes="180px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
