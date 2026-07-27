import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JobApplicationForm } from '@/components/forms/JobApplicationForm';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { SectionLabel } from '@/components/ui/Typography';
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
    title: { absolute: t.careers.metaTitle },
    description: t.careers.metaDescription,
    alternates: { canonical: localePath(locale, routes.careers) },
    openGraph: { title: t.careers.metaTitle, description: t.careers.metaDescription },
  };
}

/** Lavora con noi (mockup 2h): posizioni aperte e candidatura spontanea. */
export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const t = getDictionary(typedLocale);
  const careersPath = localePath(typedLocale, routes.careers);

  return (
    <>
      <PageHero
        eyebrow={t.careers.eyebrow}
        title={
          <>
            {t.careers.titleLine1}
            <br />
            {t.careers.titleLine2}
          </>
        }
        photo={t.careers.heroPhoto}
        photoSrc={photos.pageHero.careers}
        height={320}
        showTwinkles={false}
      />

      {/* --- Perché lavorare qui -------------------------------------------- */}
      <Container className="flex flex-col gap-30 pt-44 lg:flex-row lg:gap-60 lg:pt-64">
        <p className="flex-1 font-body text-16 leading-185 text-ink-2">{t.careers.intro}</p>
        <ul className="flex flex-1 flex-col gap-14 font-body text-15 font-medium text-ink-2">
          {t.careers.benefits.map((benefit) => (
            <li key={benefit} className="flex items-baseline gap-12">
              <span aria-hidden="true" className="flex-none text-gold">
                —
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </Container>

      {/* --- Posizioni aperte ------------------------------------------------ */}
      <Container className="pt-50 lg:pt-60">
        <SectionLabel>{t.careers.positionsLabel}</SectionLabel>
        <ul className="mt-24 flex flex-col gap-14">
          {t.careers.positions.map((position) => (
            <li
              key={position.slug}
              className="flex flex-col gap-16 border border-hairline bg-panel-ime px-24 py-26 md:flex-row md:items-center md:gap-30 md:px-32 md:py-28"
            >
              <div className="flex-1">
                <h3 className="font-display text-21 font-medium md:text-24">{position.title}</h3>
                <p className="mt-7 font-body text-15 leading-170 font-medium text-ink-3">
                  {position.text}
                </p>
              </div>
              <div className="flex flex-none flex-wrap items-center gap-x-26 gap-y-8 font-body text-11-5 tracking-14 text-ink-2">
                <span>{position.contract}</span>
                <span>{position.place}</span>
                <Link
                  href={`${careersPath}?ruolo=${position.slug}#candidatura`}
                  className="text-gold transition-colors duration-200 ease-out hover:text-gold-hover"
                >
                  {t.careers.apply} <span aria-hidden="true">→</span>
                  <span className="sr-only"> — {position.title}</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      {/* --- Candidatura spontanea ------------------------------------------- */}
      <Container className="flex flex-col items-stretch gap-34 pt-50 pb-60 lg:flex-row lg:gap-44 lg:pt-60 lg:pb-80">
        <PhotoSlot
          label={t.careers.form.photo}
          src={photos.careersForm}
          alt={t.careers.form.title}
          className="h-240 flex-none lg:h-auto lg:w-380"
          sizes="(max-width: 1200px) 100vw, 380px"
        />
        <JobApplicationForm positions={t.careers.positions} />
      </Container>
    </>
  );
}
