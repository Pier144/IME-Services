import Link from 'next/link';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { getSubjectType } from '@/data/subject-types';
import type { Subject } from '@/data/subjects';
import { localePath, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

/**
 * Card del catalogo: foto, nome in display, tipologia in maiuscoletto spaziato.
 * Tre misure, tutte prese dai mockup:
 *   catalog  → griglia 4 colonne di /luminarie (foto 210)
 *   home     → griglia 3 colonne della home (foto 250)
 *   related  → "Soggetti simili" nella scheda (foto 170, senza tipologia)
 */
export function SubjectCard({
  subject,
  locale,
  size = 'catalog',
  priority,
}: {
  subject: Subject;
  locale: Locale;
  size?: 'catalog' | 'home' | 'related';
  priority?: boolean;
}) {
  const type = getSubjectType(subject.type);

  const media = {
    catalog: 'h-180 md:h-210',
    home: 'h-210 md:h-250',
    related: 'h-150 md:h-170',
  }[size];

  const name = {
    catalog: 'mt-12 text-18',
    home: 'mt-14 text-19',
    related: 'mt-10 text-16',
  }[size];

  return (
    <Link
      href={localePath(locale, routes.subject(subject.slug))}
      className="group/card block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <PhotoSlot
        label={subject.photo}
        src={subject.src}
        alt={subject.name}
        className={cn('card-media', media)}
        sizes="(max-width: 900px) 100vw, 300px"
        priority={priority}
      />
      <h3
        className={cn(
          'font-display font-medium text-pretty transition-colors duration-200 ease-out group-hover/card:text-gold',
          name,
        )}
      >
        {subject.name}
      </h3>
      {size !== 'related' && type && (
        <p
          className={cn(
            'mt-4 font-body font-normal tracking-18 text-ink-3',
            size === 'home' ? 'text-11' : 'text-10-5',
          )}
        >
          {type.display}
        </p>
      )}
    </Link>
  );
}
