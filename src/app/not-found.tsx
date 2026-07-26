import Link from 'next/link';
import { fontVariables } from '@/lib/fonts';
import { getDictionary } from '@/i18n';
import { defaultLocale, htmlLang, localePath } from '@/i18n/config';
import { routes } from '@/lib/routes';
import './globals.css';

/**
 * 404 globale: risponde agli indirizzi che non ricadono né sotto una lingua né
 * sotto l'area riservata. Porta con sé `<html>` e `<body>` perché il layout
 * radice è di passaggio.
 */
export default function GlobalNotFound() {
  const t = getDictionary(defaultLocale);

  return (
    <html lang={htmlLang[defaultLocale]} className={fontVariables}>
      <body>
        <main className="flex min-h-screen flex-col justify-center px-24 py-70 lg:px-90">
          <p className="font-body text-11 tracking-30 text-gold">{t.notFound.eyebrow}</p>
          <h1 className="mt-14 max-w-640 font-display text-32 leading-110 font-medium text-pretty md:text-46">
            {t.notFound.title}
          </h1>
          <p className="mt-16 max-w-520 font-body text-16 leading-170 font-light text-ink-2">
            {t.notFound.text}
          </p>
          <Link
            href={localePath(defaultLocale, routes.home)}
            className="mt-30 inline-flex w-fit items-center bg-gold px-32 py-13 font-body text-12-5 font-semibold tracking-12 text-gold-ink"
          >
            {t.notFound.home}
          </Link>
        </main>
      </body>
    </html>
  );
}
