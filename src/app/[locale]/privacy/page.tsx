import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Display, Eyebrow } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { isLocale, localePath } from '@/i18n/config';
import { routes } from '@/lib/routes';

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
    title: { absolute: t.privacy.metaTitle },
    description: t.privacy.metaDescription,
    alternates: { canonical: localePath(locale, routes.privacy) },
    robots: { index: true, follow: true },
  };
}

/**
 * Informativa privacy.
 * La pagina è linkata da footer e form, quindi deve esistere. Il testo qui
 * dentro è una traccia: il testo legale definitivo arriva dal consulente
 * privacy dell'azienda e va sostituito prima della pubblicazione.
 */
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  return (
    <Container size="article" className="pt-50 pb-60 lg:pt-70 lg:pb-80">
      <Eyebrow tone="gold" size="sm" tracking="30">
        {t.privacy.eyebrow}
      </Eyebrow>
      <Display as="h1" className="mt-14 text-32 leading-110 md:text-46">
        {t.privacy.title}
      </Display>
      <p className="mt-16 font-body text-17 leading-165 font-light text-ink md:text-20">
        {t.privacy.intro}
      </p>

      <p className="mt-26 border-l-2 border-gold py-6 pl-26 font-body text-14 leading-170 font-light text-ink-3">
        {t.privacy.placeholder}
      </p>

      {t.privacy.sections.map((section) => (
        <section key={section.title} className="mt-34">
          <h2 className="font-display text-21 font-medium md:text-24">{section.title}</h2>
          <p className="mt-10 font-body text-15-5 leading-185 font-light text-ink-2 md:text-16-5">
            {section.text}
          </p>
        </section>
      ))}
    </Container>
  );
}
