import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { I18nProvider } from '@/i18n/provider';
import { getDictionary } from '@/i18n';
import { htmlLang, isLocale, locales, localePath, type Locale } from '@/i18n/config';
import { QuoteRequestProvider } from '@/lib/request-context';
import { fontVariables } from '@/lib/fonts';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    alternates: {
      canonical: localePath(locale, '/'),
      languages: {
        it: '/',
        en: '/en',
        'x-default': '/',
      },
    },
    openGraph: {
      siteName: site.shortName,
      type: 'website',
      locale: locale === 'it' ? 'it_IT' : 'en_GB',
    },
  };
}

/**
 * Cornice del sito pubblico: qui vivono `<html>` e `<body>`, perché è il primo
 * punto in cui si conosce la lingua. Header e Footer sono identici su tutte le
 * pagine, come chiede il vincolo 5 del brief.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dictionary = getDictionary(typedLocale);

  return (
    <html lang={htmlLang[typedLocale]} className={fontVariables} suppressHydrationWarning>
      <body>
        <I18nProvider locale={typedLocale} dictionary={dictionary}>
          <QuoteRequestProvider>
            <a
              href="#contenuto"
              className="sr-only focus:not-sr-only focus:absolute focus:top-14 focus:left-14 focus:z-50 focus:bg-gold focus:px-16 focus:py-10 focus:font-body focus:text-13 focus:tracking-12 focus:text-gold-ink"
            >
              {dictionary.common.skipToContent}
            </a>
            <Header />
            <main id="contenuto">{children}</main>
            <Footer locale={typedLocale} />
          </QuoteRequestProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
