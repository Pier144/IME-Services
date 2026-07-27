import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AddToRequestButton } from '@/components/catalogo/AddToRequestButton';
import { SubjectCard } from '@/components/catalogo/SubjectCard';
import { SubjectGallery } from '@/components/catalogo/SubjectGallery';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Display, Eyebrow, SectionLabel } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { isLocale, locales, localePath, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { getSubject, relatedSubjects, subjects } from '@/data/subjects';
import { getSubjectType } from '@/data/subject-types';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    subjects.map((subject) => ({ locale, slug: subject.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const subject = getSubject(slug);
  if (!isLocale(locale) || !subject) return {};

  const type = getSubjectType(subject.type);
  const title = `${subject.name} — ${type?.name ?? ''} | ${site.shortName}`;

  return {
    title: subject.name,
    description: subject.description.slice(0, 160),
    alternates: { canonical: localePath(locale, routes.subject(subject.slug)) },
    openGraph: { title, description: subject.description.slice(0, 200), type: 'article' },
  };
}

/**
 * Scheda soggetto (mockup 2b).
 * A sinistra la galleria, a destra nome, scheda tecnica e le due azioni:
 * preventivo diretto oppure aggiunta alla richiesta multipla.
 */
export default async function SubjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const subject = getSubject(slug);
  if (!subject) notFound();

  const typedLocale = locale as Locale;
  const t = getDictionary(typedLocale);
  const type = getSubjectType(subject.type);
  const season = subject.seasons[0];
  const related = relatedSubjects(subject);

  return (
    <>
      <Container className="pt-26">
        <Breadcrumb
          tracking="18"
          items={[
            { label: t.nav.luminarie.toUpperCase(), href: localePath(typedLocale, routes.luminarie) },
            {
              label: t.nav.seasons[season].toUpperCase(),
              href: `${localePath(typedLocale, routes.luminarie)}?stagione=${season}`,
            },
            { label: type?.display ?? '' },
          ]}
        />
      </Container>

      {/* --- Galleria + scheda tecnica ------------------------------------ */}
      <Container className="flex flex-col gap-34 pt-24 pb-50 lg:flex-row lg:gap-52 lg:pb-70">
        <div className="min-w-0 flex-1">
          <SubjectGallery shots={subject.gallery} name={subject.name} />
        </div>

        <div className="flex-none lg:w-400">
          <Display as="h1" className="text-30 leading-115 md:text-40">
            {subject.name}
          </Display>
          {type && (
            <Eyebrow tone="gold" size="sm" tracking="16" className="mt-10">
              {t.subject.typeLabel} · {type.display}
            </Eyebrow>
          )}
          <p className="mt-18 font-body text-16 leading-170 text-ink-2">
            {subject.description}
          </p>

          <div className="mt-28 border-t border-hairline-strong">
            <h2 className="sr-only">{t.subject.specsTitle}</h2>
            <dl>
              {subject.specs.map((spec) => (
                <div
                  key={spec.key}
                  className="flex justify-between gap-20 border-b border-hairline py-13 font-body text-15 font-medium"
                >
                  <dt className="text-ink-3">{t.subject.specs[spec.key]}</dt>
                  <dd className="text-right text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-26 flex flex-wrap gap-12">
            <ButtonLink
              href={`${localePath(typedLocale, routes.custom)}?soggetto=${subject.slug}#richiesta`}
              variant="gold"
              size="block"
              className="flex-1"
            >
              {t.subject.quote}
            </ButtonLink>
            <AddToRequestButton slug={subject.slug} name={subject.name} type={subject.type} />
          </div>

          <p className="mt-16 font-body text-14 leading-170 font-medium text-ink-3">
            {t.subject.note}
          </p>
        </div>
      </Container>

      {/* --- Dove l'abbiamo installato ------------------------------------ */}
      <Container className="pb-50 lg:pb-70">
        <SectionLabel>{t.subject.installations}</SectionLabel>
        <div className="mt-24 grid grid-cols-1 gap-22 sm:grid-cols-2 md:grid-cols-3">
          {subject.installations.map((installation) => (
            <div key={installation.place}>
              <PhotoSlot
                label={installation.photo}
                src={installation.src}
                alt={`${subject.name} — ${installation.place}`}
                className="h-190 md:h-220"
                sizes="(max-width: 900px) 100vw, 340px"
              />
              <h3 className="mt-12 font-display text-17 font-medium">{installation.place}</h3>
              <p className="mt-3 font-body text-12 text-ink-3">{installation.meta}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* --- Soggetti simili ---------------------------------------------- */}
      <Container className="border-t border-hairline pt-40 pb-60 lg:pt-56 lg:pb-80">
        <div className="flex flex-wrap items-baseline justify-between gap-14">
          <Display as="h2" className="text-24 md:text-28">
            {t.subject.similar}
          </Display>
          <ArrowLink
            href={`${localePath(typedLocale, routes.luminarie)}?stagione=${season}&tipologia=${subject.type}`}
            size="sm"
          >
            {t.subject.similarLink}
          </ArrowLink>
        </div>
        <div className="mt-26 grid grid-cols-2 gap-20 lg:grid-cols-4">
          {related.map((item) => (
            <SubjectCard key={item.slug} subject={item} locale={typedLocale} size="related" />
          ))}
        </div>
      </Container>
    </>
  );
}
