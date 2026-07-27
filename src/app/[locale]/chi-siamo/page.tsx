import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LogoFabbrica } from '@/components/brand/LogoFabbrica';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { PageHero } from '@/components/ui/PageHero';
import { Display, SectionLabel } from '@/components/ui/Typography';
import { twinklePresets } from '@/components/media/Twinkles';
import { getDictionary } from '@/i18n';
import { isLocale, localePath, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { photos } from '@/data/photos';

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
    title: { absolute: t.about.metaTitle },
    description: t.about.metaDescription,
    alternates: { canonical: localePath(locale, routes.about) },
    openGraph: { title: t.about.metaTitle, description: t.about.metaDescription },
  };
}

/** Colore del filetto sopra ogni fase della timeline. */
const accents: Record<string, { rule: string; year: string }> = {
  blue: { rule: 'border-blue', year: 'text-blue-lt' },
  red: { rule: 'border-red', year: 'text-rose' },
  gold: { rule: 'border-gold', year: 'text-gold' },
};

/** Chi siamo (mockup 2f): storia, timeline, numeri, luoghi di lavoro. */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const t = getDictionary(typedLocale);

  return (
    <>
      <PageHero
        eyebrow={t.about.eyebrow}
        title={t.about.title}
        photo={t.about.heroPhoto}
        photoSrc={photos.pageHero.about}
        height={340}
        showTwinkles={false}
      />

      {/* --- Affermazione + racconto --------------------------------------- */}
      <Container className="flex flex-col gap-30 pt-50 lg:flex-row lg:gap-60 lg:pt-70">
        <Display as="h2" className="flex-1 text-24 leading-140 md:text-30">
          {t.about.statement}
        </Display>
        <div className="flex-1 font-body text-16 leading-185 font-light text-ink-2">
          <p>
            {t.about.body1} <LogoFabbrica className="text-18" />.
          </p>
          <p className="mt-26">{t.about.body2}</p>
        </div>
      </Container>

      {/* --- La nostra storia ---------------------------------------------- */}
      <Container className="pt-50 lg:pt-60">
        <SectionLabel>{t.about.timelineLabel}</SectionLabel>
        <ol className="mt-30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {t.about.timeline.map((phase, index) => {
            const accent = accents[phase.accent] ?? accents.gold;
            return (
              <li
                key={phase.year}
                className={[
                  'border-t-2 pt-24 pb-24',
                  accent.rule,
                  index === 0 ? 'lg:pr-30' : 'lg:px-30',
                  index === t.about.timeline.length - 1 ? 'lg:pr-0 lg:pl-30' : '',
                ].join(' ')}
              >
                <p className={`font-display text-28 font-medium md:text-32 ${accent.year}`}>
                  {phase.year}
                </p>
                <h3 className="mt-10 font-display text-20 font-medium">{phase.title}</h3>
                <p className="mt-8 font-body text-14-5 leading-170 font-light text-ink-3">
                  {phase.text}
                </p>
              </li>
            );
          })}
        </ol>
      </Container>

      {/*
        I numeri sono stime concordate in fase di design.
        Vanno confermati dal cliente prima della pubblicazione
        (design/README.md, mockup 2f).
      */}
      <Container className="pt-50 lg:pt-64">
        <dl className="grid grid-cols-2 gap-20 border-y border-hairline-strong py-34 text-center lg:grid-cols-4 lg:py-44">
          {t.about.numbers.map((number) => (
            <div key={number.label}>
              <dt className="sr-only">{number.label}</dt>
              <dd>
                <span className="block font-display text-34 font-medium text-gold md:text-44">
                  {number.value}
                </span>
                <span className="mt-8 block font-body text-11-5 tracking-18 text-ink-3">
                  {number.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>

      {/* --- Dove lavoriamo ------------------------------------------------ */}
      <Container className="pt-50 lg:pt-60">
        <SectionLabel>{t.about.placesLabel}</SectionLabel>
        <div className="mt-24 grid grid-cols-1 gap-22 sm:grid-cols-2 lg:grid-cols-3">
          {t.about.places.map((place, index) => (
            <div key={place.title}>
              <PhotoSlot
                label={place.photo}
                src={photos.aboutPlaces[index]}
                alt={place.title}
                className="h-200 md:h-230"
                sizes="(max-width: 900px) 100vw, 340px"
              />
              <h3 className="mt-12 font-display text-18 font-medium">{place.title}</h3>
              <p className="mt-5 font-body text-13-5 leading-160 font-light text-ink-3">
                {place.text}
              </p>
            </div>
          ))}
        </div>
      </Container>

      <CtaBand
        title={t.about.cta.title}
        subtitle={t.about.cta.subtitle}
        buttonLabel={t.about.cta.button}
        href={localePath(typedLocale, routes.custom)}
        twinkles={twinklePresets.ctaAbout}
        className="mt-50 mb-60 lg:mt-70 lg:mb-80"
      />
    </>
  );
}
