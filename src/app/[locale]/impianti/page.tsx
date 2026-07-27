import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { CtaBand } from '@/components/ui/CtaBand';
import { Display, Eyebrow, SectionLabel } from '@/components/ui/Typography';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { getDictionary } from '@/i18n';
import { isLocale, localePath, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { site } from '@/lib/site';
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
    title: { absolute: t.impianti.metaTitle },
    description: t.impianti.metaDescription,
    alternates: { canonical: localePath(locale, routes.impianti) },
    openGraph: { title: t.impianti.metaTitle, description: t.impianti.metaDescription },
  };
}

/** Impianti (mockup 2g): servizi, processo in quattro passi, settori. */
export default async function ImpiantiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const t = getDictionary(typedLocale);

  return (
    <>
      {/* --- Hero split ---------------------------------------------------- */}
      <section className="flex flex-col items-stretch lg:flex-row">
        <div className="flex-1 bg-panel-ime px-24 py-50 lg:py-70 lg:pr-60 lg:pl-90">
          <Eyebrow tone="blue" size="sm" tracking="16">
            {t.impianti.eyebrow}
          </Eyebrow>
          <Display as="h1" className="mt-18 max-w-420 text-32 leading-114 md:text-46">
            {t.impianti.title}
          </Display>
          <p className="mt-16 max-w-440 font-body text-16 leading-170 text-ink-2">
            {t.impianti.intro}
          </p>
          <div className="mt-30 flex flex-wrap gap-14">
            <ButtonLink
              href={`${localePath(typedLocale, routes.custom)}#richiesta`}
              variant="gold"
              size="inline"
            >
              {t.impianti.ctaPrimary}
            </ButtonLink>
            <ButtonLink href={`tel:${site.phoneHref}`} variant="ghost" size="inline">
              {site.phone}
            </ButtonLink>
          </div>
        </div>
        <PhotoSlot
          label={t.impianti.heroPhoto}
          src={photos.pageHero.impianti}
          alt={t.impianti.title}
          className="h-240 flex-none md:h-300 lg:h-auto lg:w-480"
          sizes="(max-width: 1200px) 100vw, 480px"
          priority
        />
      </section>

      {/* --- Cosa facciamo -------------------------------------------------- */}
      <Container className="pt-50 lg:pt-70">
        <SectionLabel>{t.impianti.servicesLabel}</SectionLabel>
        <div className="mt-26 grid grid-cols-1 gap-22 sm:grid-cols-2 lg:grid-cols-3">
          {t.impianti.services.map((service, index) => (
            <article
              key={service.title}
              className="overflow-hidden border border-hairline bg-panel-ime px-24 pt-0 pb-30 md:px-32 md:pb-34"
            >
              {/* La foto è a filo: i margini negativi annullano il padding della card. */}
              <PhotoSlot
                label={service.photo}
                src={photos.impiantiServices[index]}
                alt={service.title}
                className="-mx-24 h-140 md:-mx-32 md:h-150"
                sizes="(max-width: 900px) 100vw, 360px"
              />
              <h3 className="mt-26 font-display text-21 font-medium md:text-23">{service.title}</h3>
              <p className="mt-10 font-body text-15 leading-175 font-medium text-ink-3">
                {service.text}
              </p>
            </article>
          ))}
        </div>
      </Container>

      {/* --- Come lavoriamo -------------------------------------------------- */}
      <Container className="pt-50 lg:pt-64">
        <SectionLabel>{t.impianti.processLabel}</SectionLabel>
        <ol className="mt-26 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {t.impianti.process.map((step, index) => (
            <li
              key={step.number}
              className={[
                'border-t-2 py-24',
                index === 0 ? 'border-gold' : 'border-rule-step',
                index === 0 ? 'lg:pr-28' : 'lg:px-28',
                index === t.impianti.process.length - 1 ? 'lg:pr-0 lg:pl-28' : '',
              ].join(' ')}
            >
              <p
                className={[
                  'font-body text-13 tracking-20',
                  index === 0 ? 'text-gold' : 'text-ink-3',
                ].join(' ')}
              >
                {step.number}
              </p>
              <h3 className="mt-9 font-display text-20 font-medium">{step.title}</h3>
              <p className="mt-7 font-body text-15 leading-165 font-medium text-ink-3">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>

      {/* --- Settori + rimando alle Luminarie -------------------------------- */}
      <Container className="flex flex-col items-start gap-34 pt-50 lg:flex-row lg:gap-44 lg:pt-64">
        <div className="w-full flex-1">
          <SectionLabel>{t.impianti.sectorsLabel}</SectionLabel>
          <ul className="mt-22">
            {t.impianti.sectors.map((sector) => (
              <li
                key={sector.number}
                className="flex flex-wrap items-baseline gap-x-18 gap-y-4 border-b border-cta-line py-15"
              >
                <span className="w-30 flex-none font-body text-12 text-blue-lt">{sector.number}</span>
                <span className="flex-1 font-display text-18 font-medium md:text-19">
                  {sector.title}
                </span>
                <span className="font-body text-13-5 font-medium text-ink-3">{sector.note}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="w-full flex-none border border-hairline bg-panel-fabbrica px-24 py-30 lg:w-340 lg:px-32">
          <Eyebrow tone="rose" size="sm" tracking="18">
            {t.impianti.aside.eyebrow}
          </Eyebrow>
          <Display as="h2" className="mt-12 text-21 leading-135 md:text-23">
            {t.impianti.aside.title}
          </Display>
          <p className="mt-10 font-body text-15 leading-170 font-medium text-ink-3">
            {t.impianti.aside.text}
          </p>
          <ArrowLink href={localePath(typedLocale, routes.luminarie)} className="mt-20">
            {t.impianti.aside.link}
          </ArrowLink>
        </aside>
      </Container>

      <CtaBand
        title={t.impianti.cta.title}
        subtitle={t.impianti.cta.subtitle}
        buttonLabel={t.impianti.cta.button}
        href={`${localePath(typedLocale, routes.custom)}#richiesta`}
        className="mt-50 mb-60 lg:mt-70 lg:mb-80"
      />
    </>
  );
}
