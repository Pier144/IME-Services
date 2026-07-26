import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SubjectCard } from '@/components/catalogo/SubjectCard';
import { ChipLink } from '@/components/ui/Chip';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { PageHero } from '@/components/ui/PageHero';
import { getDictionary } from '@/i18n';
import { isLocale, localePath, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { subjects } from '@/data/subjects';
import { seasons, typesForSeason, type Season } from '@/data/subject-types';
import { firstParam } from '@/lib/utils';
import { cn } from '@/lib/utils';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    // Il nome dell'azienda è già nel titolo: niente suffisso automatico.
    title: { absolute: t.luminarie.metaTitle },
    description: t.luminarie.metaDescription,
    alternates: { canonical: localePath(locale, routes.luminarie) },
    openGraph: { title: t.luminarie.metaTitle, description: t.luminarie.metaDescription },
  };
}

/**
 * Catalogo luminarie (mockup 2a).
 *
 * Stagione e tipologia vivono in querystring, non nello stato del componente:
 * l'indirizzo di una selezione è condivisibile, la pagina resta statica e i
 * filtri funzionano anche senza JavaScript.
 */
export default async function LuminariePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const t = getDictionary(typedLocale);
  const query = await searchParams;

  const seasonParam = firstParam(query.stagione);
  const season: Season = seasons.includes(seasonParam as Season)
    ? (seasonParam as Season)
    : 'natalizie';

  const availableTypes = typesForSeason(season);
  const typeParam = firstParam(query.tipologia);
  const activeType = availableTypes.some((type) => type.slug === typeParam) ? typeParam : undefined;

  const filtered = subjects.filter(
    (subject) =>
      subject.seasons.includes(season) && (!activeType || subject.type === activeType),
  );

  const base = localePath(typedLocale, routes.luminarie);
  const hrefFor = (nextSeason: Season, nextType?: string) => {
    const search = new URLSearchParams({ stagione: nextSeason });
    if (nextType) search.set('tipologia', nextType);
    return `${base}?${search.toString()}`;
  };

  return (
    <>
      <PageHero
        eyebrow={t.luminarie.breadcrumb}
        eyebrowTone="muted"
        title={t.luminarie.title}
        intro={t.luminarie.intro}
        photo={t.luminarie.heroPhoto}
        height={300}
      />

      {/* --- Tab stagione ------------------------------------------------- */}
      <div className="border-b border-hairline">
        <Container>
          <nav
            aria-label={t.luminarie.seasonsLabel}
            className="flex gap-40 overflow-x-auto font-body text-14 tracking-20"
          >
            {seasons.map((value) => {
              const active = value === season;
              return (
                <Link
                  key={value}
                  href={hrefFor(value)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex-none py-22 transition-colors duration-200 ease-out',
                    active ? 'text-gold shadow-tab-active' : 'text-ink-3 hover:text-gold',
                  )}
                >
                  {t.nav.seasons[value].toUpperCase()}
                </Link>
              );
            })}
          </nav>
        </Container>
      </div>

      {/* --- Chip tipologia ----------------------------------------------- */}
      <Container className="flex flex-col gap-16 pt-30 md:flex-row md:items-center md:justify-between">
        <div
          role="group"
          aria-label={t.luminarie.filtersLabel}
          className="flex flex-wrap gap-9 font-body"
        >
          <ChipLink href={hrefFor(season)} active={!activeType}>
            {t.luminarie.allTypes}
          </ChipLink>
          {availableTypes.map((type) => (
            <ChipLink
              key={type.slug}
              href={hrefFor(season, type.slug)}
              active={activeType === type.slug}
            >
              {type.name}
            </ChipLink>
          ))}
        </div>
        <p className="flex-none font-body text-12 text-ink-3">
          {filtered.length} {filtered.length === 1 ? t.luminarie.countOne : t.luminarie.countMany}
        </p>
      </Container>

      {/* --- Griglia catalogo --------------------------------------------- */}
      <Container className="pt-34 pb-60 lg:pb-80">
        {filtered.length === 0 ? (
          <div className="border border-hairline bg-panel-ime px-24 py-40 text-center">
            <p className="font-body text-15 font-light text-ink-2">{t.luminarie.empty}</p>
            <Link
              href={hrefFor(season)}
              className="mt-14 inline-block font-body text-12-5 font-medium tracking-14 text-gold hover:text-gold-hover"
            >
              {t.luminarie.emptyAction} →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-22 gap-y-24 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((subject, index) => (
              <SubjectCard
                key={subject.slug}
                subject={subject}
                locale={typedLocale}
                priority={index < 4}
              />
            ))}
          </div>
        )}
      </Container>

      <CtaBand
        title={t.luminarie.cta.title}
        subtitle={t.luminarie.cta.subtitle}
        buttonLabel={t.luminarie.cta.button}
        href={localePath(typedLocale, routes.custom)}
        className="mb-60 lg:mb-80"
      />
    </>
  );
}
