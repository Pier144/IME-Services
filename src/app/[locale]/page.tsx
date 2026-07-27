import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { SubjectCard } from '@/components/catalogo/SubjectCard';
import { WaveDivider } from '@/components/brand/WaveDivider';
import { LogoFabbrica } from '@/components/brand/LogoFabbrica';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { CtaBand } from '@/components/ui/CtaBand';
import { Container } from '@/components/ui/Container';
import { Display, Eyebrow, SectionLabel } from '@/components/ui/Typography';
import { twinklePresets } from '@/components/media/Twinkles';
import { getDictionary } from '@/i18n';
import { isLocale, localePath, type Locale } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { routes } from '@/lib/routes';
import { subjects } from '@/data/subjects';
import { categoryDisplay, getNewsCategory } from '@/data/news-categories';
import { listLatest } from '@/lib/articles/repository';
import { formatShortDate } from '@/lib/dates';

/** I tre soggetti in vetrina, gli stessi del mockup 1a. */
const HIGHLIGHTED = ['albero-galassia', 'onda-di-stelle', 'zucca-lanterna'];

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
    title: { absolute: t.home.metaTitle },
    description: t.home.metaDescription,
    alternates: { canonical: localePath(locale, routes.home) },
    openGraph: { title: t.home.metaTitle, description: t.home.metaDescription },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const t = getDictionary(typedLocale);

  const showcase = HIGHLIGHTED.map((slug) => subjects.find((subject) => subject.slug === slug)).filter(
    (subject): subject is NonNullable<typeof subject> => Boolean(subject),
  );
  const latest = await listLatest(3);

  return (
    <>
      <HeroCarousel />

      {/* --- Due anime, una famiglia ------------------------------------- */}
      <Container className="pt-56 pb-50 lg:pt-76 lg:pb-70">
        <SectionLabel className="text-center">{t.home.souls.label}</SectionLabel>

        <div className="mt-40 flex flex-col items-stretch md:flex-row">
          <div className="flex-1 border border-panel-line bg-panel-ime px-24 py-34 md:px-46 md:py-44">
            <Display as="h3" className="text-24 text-white md:text-30">
              {t.home.souls.ime.title}
            </Display>
            <Eyebrow tone="blue" size="lg" tracking="16" className="mt-6">
              {t.home.souls.ime.eyebrow}
            </Eyebrow>
            <ul className="mt-26 flex flex-col gap-12 font-body text-16 text-ink-2">
              {t.home.souls.ime.bullets.map((bullet) => (
                <li key={bullet} className="flex items-baseline gap-10">
                  <span
                    aria-hidden="true"
                    className="relative -top-2 size-5 flex-none rounded-full bg-blue-dot"
                  />
                  {bullet}
                </li>
              ))}
            </ul>
            <ArrowLink href={localePath(typedLocale, routes.impianti)} className="mt-30">
              {t.home.souls.ime.link}
            </ArrowLink>
          </div>

          <WaveDivider className="hidden w-110 md:flex" />

          <div className="mt-24 flex-1 border border-panel-line bg-panel-fabbrica px-24 py-34 md:mt-0 md:px-46 md:py-44">
            <LogoFabbrica as="h3" className="text-28 md:text-34" />
            <Eyebrow tone="rose" size="lg" tracking="16" className="mt-6">
              {t.home.souls.fabbrica.eyebrow}
            </Eyebrow>
            <ul className="mt-26 flex flex-col gap-12 font-body text-16 text-ink-2">
              {t.home.souls.fabbrica.bullets.map((bullet) => (
                <li key={bullet} className="flex items-baseline gap-10">
                  <span
                    aria-hidden="true"
                    className="relative -top-2 size-5 flex-none rounded-full bg-red"
                  />
                  {bullet}
                </li>
              ))}
            </ul>
            <ArrowLink href={localePath(typedLocale, routes.luminarie)} className="mt-30">
              {t.home.souls.fabbrica.link}
            </ArrowLink>
          </div>
        </div>
      </Container>

      {/* --- Catalogo dei soggetti --------------------------------------- */}
      <Container className="pb-60 lg:pb-80">
        <div className="flex flex-wrap items-baseline justify-between gap-14">
          <Display as="h2" className="text-26 md:text-32">
            {t.home.catalog.title}
          </Display>
          <ArrowLink href={localePath(typedLocale, routes.luminarie)}>
            {t.home.catalog.link}
          </ArrowLink>
        </div>
        <div className="mt-30 grid grid-cols-1 gap-22 sm:grid-cols-2 md:grid-cols-3">
          {showcase.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} locale={typedLocale} size="home" />
          ))}
        </div>
      </Container>

      {/* --- Dalla Fabbrica ---------------------------------------------- */}
      <Container className="pb-60 lg:pb-80">
        <div className="flex flex-col gap-30 border-t border-hairline pt-40 md:flex-row md:gap-60 lg:pt-56">
          <div className="flex-none md:w-300">
            <Display as="h2" className="text-26 md:text-32">
              {t.home.news.title}
            </Display>
            <p className="mt-12 font-body text-16 leading-170 text-ink-3">
              {t.home.news.intro}
            </p>
            <ArrowLink href={localePath(typedLocale, routes.news)} className="mt-22">
              {t.home.news.link}
            </ArrowLink>
          </div>

          <div className="flex flex-1 flex-col">
            {latest.length === 0 && (
              <p className="font-body text-16 text-ink-3">{t.home.news.empty}</p>
            )}
            {latest.map((article) => {
              const category = getNewsCategory(article.category);
              return (
                <Link
                  key={article.id}
                  href={localePath(typedLocale, routes.article(article.slug))}
                  className="group/row flex flex-col gap-6 border-b border-hairline py-16 md:flex-row md:items-baseline md:gap-20"
                >
                  <time
                    dateTime={(article.publishedAt ?? article.createdAt).toISOString()}
                    className="flex-none font-body text-12 font-medium text-ink-3 md:w-90"
                  >
                    {formatShortDate(article.publishedAt ?? article.createdAt, typedLocale)}
                  </time>
                  <span className="flex-1 font-display text-16 font-medium text-pretty transition-colors duration-200 ease-out group-hover/row:text-gold md:text-18">
                    {article.title}
                  </span>
                  <span
                    className={cnCategory(category?.tone)}
                  >
                    {categoryDisplay(article.category)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>

      <CtaBand
        title={t.home.cta.title}
        subtitle={t.home.cta.subtitle}
        buttonLabel={t.home.cta.button}
        href={localePath(typedLocale, routes.custom)}
        variant="home"
        twinkles={twinklePresets.ctaHome}
      />
    </>
  );
}

/** L'occhiello di categoria: blu per il mondo impianti, rosa per la Fabbrica. */
function cnCategory(tone: 'blue' | 'rose' | undefined) {
  return [
    'font-body text-10-5 font-medium tracking-16',
    tone === 'rose' ? 'text-rose' : 'text-blue-lt',
  ].join(' ');
}
