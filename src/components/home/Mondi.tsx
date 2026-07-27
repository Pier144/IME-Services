import Link from 'next/link';
import { Display } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { localePath, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

/**
 * La fascia subito sotto l'hero: a sinistra i quattro mondi in colonna, a
 * destra il discorso.
 *
 * I mondi sono le stesse quattro porte delle slide, ma qui restano ferme e
 * cliccabili: chi ha saltato il carosello, o è arrivato quando girava la slide
 * sbagliata, le ritrova tutte insieme. Ognuno prende il colore del proprio
 * mondo: rosa e rosso per il Natale e la Fabbrica, oro per gli eventi, blu per
 * gli impianti.
 */

const MONDI = [
  { colore: 'text-rose', href: routes.luminarie },
  { colore: 'text-gold', href: `${routes.luminarie}?stagione=eventi` },
  { colore: 'text-blue-lt', href: routes.impianti },
  { colore: 'text-rose-lt', href: routes.custom },
];

export function Mondi({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <section className="border-b border-hairline bg-panel-ime px-24 py-60 lg:px-46 lg:py-86">
      <div className="mx-auto grid max-w-1200 grid-cols-1 gap-40 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-90">
        <ul className="flex flex-col gap-12">
          {t.home.worlds.map((nome, i) => (
            <li key={nome}>
              <Link
                href={localePath(locale, MONDI[i].href)}
                className={cn(
                  'mondo inline-flex items-center gap-12 font-body text-19 leading-110 font-semibold tracking-08 md:text-22',
                  MONDI[i].colore,
                )}
              >
                <span aria-hidden="true" className="mondo-trattino block h-2 w-16 flex-none bg-current" />
                {nome}
              </Link>
            </li>
          ))}
        </ul>

        <div>
          <Display as="h2" className="max-w-620 text-30 leading-115 font-semibold text-balance md:text-42">
            {t.home.intro.title}
          </Display>
          <p className="mt-18 max-w-680 font-body text-16 leading-170 text-ink-2">
            {t.home.intro.text}
          </p>
        </div>
      </div>
    </section>
  );
}
