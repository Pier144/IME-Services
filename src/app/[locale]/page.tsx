import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { Mondi } from '@/components/home/Mondi';
import { HomeQuoteForm } from '@/components/home/HomeQuoteForm';
import { SubjectCard } from '@/components/catalogo/SubjectCard';
import { LogoFabbrica } from '@/components/brand/LogoFabbrica';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Display, Eyebrow } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { isLocale, localePath, type Locale } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { routes } from '@/lib/routes';
import { subjects } from '@/data/subjects';
import { photos } from '@/data/photos';
import { categoryDisplay, getNewsCategory } from '@/data/news-categories';
import { listLatest } from '@/lib/articles/repository';
import { formatShortDate } from '@/lib/dates';

/** I tre soggetti in vetrina. */
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

/**
 * Home.
 *
 * L'ordine è quello approvato dal cliente sulla bozza: prima l'hero a tutta
 * finestra, poi i quattro mondi fermi e cliccabili, le due anime in fasce
 * alternate, il catalogo, le news e in fondo la richiesta di preventivo — che
 * prima mandava altrove e ora si compila qui.
 */
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
      <Mondi locale={typedLocale} />

      <AnimaBanda
        locale={typedLocale}
        titolo={t.home.souls.ime.title}
        occhiello={t.home.souls.ime.eyebrow}
        tono="blue"
        bullets={t.home.souls.ime.bullets}
        linkLabel={t.home.souls.ime.link}
        href={routes.impianti}
        foto={photos.impiantiServices[0]}
        alt={t.home.souls.ime.title}
        fotoASinistra
      />

      <AnimaBanda
        locale={typedLocale}
        occhiello={t.home.souls.fabbrica.eyebrow}
        tono="rose"
        bullets={t.home.souls.fabbrica.bullets}
        linkLabel={t.home.souls.fabbrica.link}
        href={routes.custom}
        foto={photos.customAside}
        alt="La Fabbrica di Babbo Natale"
      />

      {/* --- Catalogo dei soggetti --------------------------------------- */}
      <section className="border-b border-hairline px-24 py-60 lg:px-46 lg:py-80">
        <div className="mx-auto max-w-1200">
          <div className="flex flex-wrap items-end justify-between gap-16">
            <Display as="h2" className="text-28 leading-115 font-semibold md:text-36">
              {t.home.catalog.title}
            </Display>
            <ArrowLink href={localePath(typedLocale, routes.luminarie)}>
              {t.home.catalog.link}
            </ArrowLink>
          </div>
          <div className="mt-32 grid grid-cols-1 gap-22 sm:grid-cols-2 md:grid-cols-3">
            {showcase.map((subject) => (
              <SubjectCard key={subject.slug} subject={subject} locale={typedLocale} size="home" />
            ))}
          </div>
        </div>
      </section>

      {/* --- Dalla Fabbrica ---------------------------------------------- */}
      <section className="border-b border-hairline px-24 py-60 lg:px-46 lg:py-80">
        <div className="mx-auto flex max-w-1200 flex-col gap-30 md:flex-row md:gap-60">
          <div className="flex-none md:w-300">
            <Display as="h2" className="text-28 leading-115 font-semibold md:text-36">
              {t.home.news.title}
            </Display>
            <p className="mt-14 font-body text-16 leading-170 text-ink-3">{t.home.news.intro}</p>
            <ArrowLink href={localePath(typedLocale, routes.news)} className="mt-22">
              {t.home.news.link}
            </ArrowLink>
          </div>

          <div className="flex flex-1 flex-col">
            {latest.length === 0 && <p className="font-body text-16 text-ink-3">{t.home.news.empty}</p>}
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
                  <span className={cnCategory(category?.tone)}>{categoryDisplay(article.category)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <HomeQuoteForm />
    </>
  );
}

/**
 * Una delle due anime: la foto occupa metà fascia e si alterna di lato fra
 * l'una e l'altra, così la pagina non scende dritta come un elenco.
 */
function AnimaBanda({
  locale,
  titolo,
  occhiello,
  tono,
  bullets,
  linkLabel,
  href,
  foto,
  alt,
  fotoASinistra = false,
}: {
  locale: Locale;
  titolo?: string;
  occhiello: string;
  tono: 'blue' | 'rose';
  bullets: readonly string[];
  linkLabel: string;
  href: string;
  foto: string;
  alt: string;
  fotoASinistra?: boolean;
}) {
  const pallino = tono === 'blue' ? 'bg-blue-dot' : 'bg-red';

  return (
    <section
      className={[
        'grid grid-cols-1 border-b border-hairline lg:grid-cols-2',
        fotoASinistra ? 'bg-night' : 'bg-panel-fabbrica',
      ].join(' ')}
    >
      <div className={['relative h-300 lg:h-full lg:min-h-460', fotoASinistra ? '' : 'lg:order-2'].join(' ')}>
        <Image src={foto} alt={alt} fill sizes="(min-width: 1200px) 50vw, 100vw" className="object-cover" />
      </div>

      <div
        className={[
          'flex flex-col justify-center px-24 py-46 lg:px-70 lg:py-80',
          fotoASinistra ? '' : 'lg:order-1',
        ].join(' ')}
      >
        <Eyebrow tone={tono} size="lg" tracking="20">
          {occhiello}
        </Eyebrow>
        {titolo ? (
          <Display as="h3" className="mt-12 text-28 leading-115 font-semibold md:text-36">
            {titolo}
          </Display>
        ) : (
          <LogoFabbrica as="h3" className="mt-12 text-30 md:text-38" />
        )}
        <ul className="mt-26 flex flex-col gap-13 font-body text-16 leading-160 text-ink-2">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-baseline gap-12">
              <span aria-hidden="true" className={`relative -top-3 size-6 flex-none rounded-full ${pallino}`} />
              {bullet}
            </li>
          ))}
        </ul>
        <ArrowLink href={localePath(locale, href)} className="mt-30">
          {linkLabel}
        </ArrowLink>
      </div>
    </section>
  );
}

/** L'occhiello di categoria: blu per il mondo impianti, rosa per la Fabbrica. */
function cnCategory(tone: 'blue' | 'rose' | undefined) {
  return [
    'font-body text-10-5 font-medium tracking-16',
    tone === 'rose' ? 'text-rose' : 'text-blue-lt',
  ].join(' ');
}
