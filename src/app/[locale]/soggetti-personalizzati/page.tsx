import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CustomSubjectForm } from '@/components/forms/CustomSubjectForm';
import { LogoFabbrica } from '@/components/brand/LogoFabbrica';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import { Container } from '@/components/ui/Container';
import { Display, Eyebrow, SectionLabel } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { isLocale, localePath, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { subjects } from '@/data/subjects';
import { addressLine, site } from '@/lib/site';
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
    title: { absolute: t.custom.metaTitle },
    description: t.custom.metaDescription,
    alternates: { canonical: localePath(locale, routes.custom) },
    openGraph: { title: t.custom.metaTitle, description: t.custom.metaDescription },
  };
}

/** Soggetti personalizzati (mockup 2c): come funziona + form con allegati. */
export default async function CustomSubjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const t = getDictionary(typedLocale);

  /** Solo slug, nome e tipologia: al form non serve tutta la scheda tecnica. */
  const catalog = subjects.map((subject) => ({
    slug: subject.slug,
    name: subject.name,
    type: subject.type,
  }));

  return (
    <>
      {/* --- Hero split ---------------------------------------------------- */}
      <section className="flex flex-col items-stretch lg:flex-row">
        <div className="flex-1 bg-panel-fabbrica px-24 py-50 lg:py-70 lg:pr-60 lg:pl-90">
          <LogoFabbrica className="text-28 md:text-34" />
          <Display as="h1" className="mt-18 max-w-420 text-32 leading-114 md:text-46">
            {t.custom.hero.title}
          </Display>
          <p className="mt-16 max-w-440 font-body text-16 leading-170 font-light text-ink-2">
            {t.custom.hero.text}
          </p>
          <dl className="mt-34 flex flex-wrap gap-24 font-body text-13-5 leading-150 font-light text-ink-3 md:gap-34">
            {t.custom.hero.numbers.map((number) => (
              <div key={number.label}>
                <dt className="sr-only">{number.label}</dt>
                <dd>
                  <span className="block font-display text-30 font-medium text-gold">
                    {number.value}
                  </span>
                  {number.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <PhotoSlot
          label={t.custom.hero.photo}
          src={photos.pageHero.custom}
          alt={t.custom.hero.title}
          className="h-240 flex-none md:h-300 lg:h-auto lg:w-480"
          sizes="(max-width: 1200px) 100vw, 480px"
          priority
        />
      </section>

      {/* --- Come funziona ------------------------------------------------- */}
      <Container className="pt-50 lg:pt-70">
        <SectionLabel>{t.custom.how.label}</SectionLabel>
        <ol className="mt-26 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {t.custom.how.steps.map((step, index) => (
            <li
              key={step.number}
              className={[
                'border-t-2 py-26',
                index === 0 ? 'border-gold' : 'border-rule-step',
                index === 0 ? 'lg:pr-26' : 'lg:px-26',
                index === t.custom.how.steps.length - 1 ? 'lg:pr-0 lg:pl-26' : '',
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
              <h3 className="mt-10 font-display text-21 font-medium">{step.title}</h3>
              <p className="mt-8 font-body text-14 leading-165 font-light text-ink-3">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>

      {/* --- Form + colonna di contatto ------------------------------------ */}
      <Container className="flex flex-col gap-34 pt-40 pb-60 lg:flex-row lg:gap-44 lg:pt-60 lg:pb-80">
        <CustomSubjectForm catalog={catalog} />

        <aside className="flex flex-none flex-col gap-22 lg:w-330">
          <PhotoSlot
            label={t.custom.aside.photo}
            src={photos.customAside}
            alt={t.custom.aside.title}
            className="h-200 md:h-230"
            sizes="(max-width: 1200px) 100vw, 330px"
          />
          <div className="border border-hairline bg-panel-fabbrica px-24 py-26 md:px-28">
            <Eyebrow tone="rose" size="sm" tracking="24">
              {t.custom.aside.eyebrow}
            </Eyebrow>
            <Display as="h2" className="mt-12 text-22 leading-135">
              {t.custom.aside.title}
            </Display>
            <p className="mt-12 font-body text-14 leading-180 font-light text-ink-2">
              <a href={`tel:${site.phoneHref}`} className="hover:text-gold">
                Tel. {site.phone}
              </a>
              <br />
              <a href={`tel:${site.mobileHref}`} className="hover:text-gold">
                Cell. {site.mobile}
              </a>
              <br />
              <a href={`mailto:${site.email}`} className="hover:text-gold">
                {site.email}
              </a>
            </p>
            <p className="mt-14 border-t border-hairline-strong pt-14 font-body text-13 leading-160 font-light text-ink-3">
              {addressLine}
              <br />
              {site.openingHours}
            </p>
          </div>
        </aside>
      </Container>
    </>
  );
}
