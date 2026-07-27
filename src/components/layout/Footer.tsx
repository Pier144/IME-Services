import Link from 'next/link';
import { LogoIme } from '@/components/brand/LogoIme';
import { localePath, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { routes } from '@/lib/routes';
import { addressLine, site } from '@/lib/site';

/**
 * Footer identico su tutte le pagine pubbliche: quattro colonne
 * (ragione sociale e sede · contatti · pagine · copyright e privacy).
 * I dati sono quelli reali dell'azienda, presi da src/lib/site.ts.
 */
export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();

  const pages = [
    { href: routes.about, label: t.nav.about },
    { href: routes.impianti, label: t.nav.impianti },
    { href: routes.luminarie, label: t.nav.luminarie },
    { href: routes.custom, label: t.nav.custom },
    { href: routes.news, label: t.nav.news },
    { href: routes.careers, label: t.nav.careers },
  ];

  return (
    <footer className="mt-80 border-t border-hairline px-24 pt-44 pb-40 lg:px-90">
      <div className="flex flex-col gap-40 font-body text-14 leading-180 font-medium text-ink-3 md:flex-row md:gap-60">
        <div className="flex-1">
          <div className="mb-12">
            <LogoIme size="footer" />
          </div>
          <address className="not-italic">
            {site.legalName}
            <br />
            {addressLine}
            <br />
            {t.footer.vat} {site.vat}
          </address>
        </div>

        <div className="flex-1">
          <h2 className="text-ink">{t.footer.contacts}</h2>
          <p>
            <a
              href={`tel:${site.phoneHref}`}
              className="transition-colors duration-200 hover:text-gold"
            >
              Tel. {site.phone}
            </a>
            {' · '}
            <a
              href={`tel:${site.mobileHref}`}
              className="transition-colors duration-200 hover:text-gold"
            >
              Cell. {site.mobile}
            </a>
            <br />
            <a
              href={`mailto:${site.email}`}
              className="transition-colors duration-200 hover:text-gold"
            >
              {site.email}
            </a>
          </p>
        </div>

        <div className="flex-1">
          <h2 className="text-ink">{t.footer.pages}</h2>
          <ul className="flex flex-wrap gap-x-8">
            {pages.map((page, index) => (
              <li key={page.href}>
                <Link
                  href={localePath(locale, page.href)}
                  className="transition-colors duration-200 hover:text-gold"
                >
                  {page.label}
                </Link>
                {index < pages.length - 1 && <span aria-hidden="true"> ·</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-none font-body text-11 tracking-08 md:self-end">
          © {year} {t.footer.rights} ·{' '}
          <Link
            href={localePath(locale, routes.privacy)}
            className="transition-colors duration-200 hover:text-gold"
          >
            {t.footer.privacy.toUpperCase()}
          </Link>{' '}
          ·{' '}
          <Link
            href={localePath(locale, routes.privacy)}
            className="transition-colors duration-200 hover:text-gold"
          >
            {t.footer.cookie.toUpperCase()}
          </Link>
        </div>
      </div>
    </footer>
  );
}
