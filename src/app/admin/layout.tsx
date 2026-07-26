import type { Metadata } from 'next';
import { I18nProvider } from '@/i18n/provider';
import { getDictionary } from '@/i18n';
import { defaultLocale, htmlLang } from '@/i18n/config';
import { fontVariables } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Area riservata',
  robots: { index: false, follow: false },
};

/**
 * Cornice dell'area riservata.
 *
 * Vive fuori dall'albero delle lingue: il backoffice è solo in italiano, non
 * va indicizzato e non ha né header né footer del sito pubblico. Sidebar
 * (mockup 2i) e topbar (mockup 2j) sono diverse fra loro, quindi le monta
 * ciascuna pagina invece del layout.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={htmlLang[defaultLocale]} className={fontVariables} suppressHydrationWarning>
      <body>
        <I18nProvider locale={defaultLocale} dictionary={getDictionary(defaultLocale)}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
