'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { LogoIme } from '@/components/brand/LogoIme';
import { useI18n } from '@/i18n/provider';
import { localePath, locales, stripLocale, type Locale } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { seasons, typesForSeason } from '@/data/subject-types';
import { useQuoteRequest } from '@/lib/request-context';
import { cn } from '@/lib/utils';

/**
 * Header identico su tutte le pagine pubbliche.
 * La voce attiva è oro; "Luminarie" apre una tendina a due colonne
 * (Natalizie / Eventi) con le tipologie sotto.
 * Sotto i 900px la navigazione diventa un pannello a tutta altezza.
 */
export function Header() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const current = stripLocale(pathname ?? '/');

  /**
   * Menu e tendina si chiudono da soli quando si cambia pagina.
   * L'apertura è memorizzata insieme al percorso in cui è avvenuta, così basta
   * confrontarli durante il rendering: nessun effetto e nessun fotogramma con
   * il menu ancora aperto sulla pagina nuova.
   */
  const [open, setOpen] = useState<{ path: string; menu: boolean; dropdown: boolean }>({
    path: pathname ?? '/',
    menu: false,
    dropdown: false,
  });
  const samePage = open.path === pathname;
  const menuOpen = samePage && open.menu;
  const dropdownOpen = samePage && open.dropdown;

  const setMenuOpen = (value: boolean) =>
    setOpen({ path: pathname ?? '/', menu: value, dropdown: false });
  const setDropdownOpen = (value: boolean) =>
    setOpen({ path: pathname ?? '/', menu: false, dropdown: value });

  // Blocca lo scorrimento del corpo quando il pannello mobile è aperto.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const items = [
    { href: routes.about, label: t.nav.about },
    { href: routes.impianti, label: t.nav.impianti },
    { href: routes.luminarie, label: t.nav.luminarie, hasMenu: true },
    { href: routes.custom, label: t.nav.custom, hasBadge: true },
    { href: routes.news, label: t.nav.news },
    { href: routes.careers, label: t.nav.careers },
  ];

  const isActive = (href: string) =>
    href === routes.home ? current === '/' : current === href || current.startsWith(`${href}/`);

  return (
    <header className="relative z-30 border-b border-hairline">
      <div className="flex items-center justify-between px-24 py-18 lg:px-40">
        <Link href={localePath(locale, routes.home)} className="flex-none" aria-label={t.common.home}>
          <LogoIme size="header" />
        </Link>

        {/* Navigazione desktop */}
        <nav
          aria-label={t.nav.mainNav}
          className="hidden items-center gap-18 font-body text-13-5 font-medium text-nav md:flex lg:gap-26"
        >
          {items.map((item) =>
            item.hasMenu ? (
              <LuminarieMenu
                key={item.href}
                label={item.label}
                active={isActive(item.href)}
                open={dropdownOpen}
                onOpenChange={setDropdownOpen}
              />
            ) : (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-8 transition-colors duration-200 ease-out hover:text-gold',
                  isActive(item.href) && 'text-gold',
                )}
              >
                {item.label}
                {item.hasBadge && <RequestBadge />}
              </Link>
            ),
          )}
          <LocaleSwitch />
        </nav>

        {/* Comandi mobile */}
        <div className="flex items-center gap-14 md:hidden">
          <LocaleSwitch />
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            className="flex flex-col justify-center gap-5 p-6"
          >
            <span className="sr-only">{menuOpen ? t.nav.closeMenu : t.nav.openMenu}</span>
            <span
              aria-hidden="true"
              className={cn(
                'block h-1 w-22 bg-ink transition-transform duration-200',
                menuOpen && 'translate-y-6 rotate-45',
              )}
            />
            <span
              aria-hidden="true"
              className={cn('block h-1 w-22 bg-ink transition-opacity duration-200', menuOpen && 'opacity-0')}
            />
            <span
              aria-hidden="true"
              className={cn(
                'block h-1 w-22 bg-ink transition-transform duration-200',
                menuOpen && '-translate-y-6 -rotate-45',
              )}
            />
          </button>
        </div>
      </div>

      {menuOpen && <MobileNav items={items} isActive={isActive} onNavigate={() => setMenuOpen(false)} />}
    </header>
  );
}

/* --------------------------------------------------------------------------
 * Tendina Luminarie
 * Due colonne (Natalizie / Eventi) con le tipologie sotto. Su desktop si apre
 * al passaggio del mouse con 120 ms di ritardo, su mobile al tocco; Esc chiude.
 *
 * Fra la voce di menu e il pannello ci sono 14px di stacco: sono dentro un
 * involucro trasparente che fa parte della tendina, non un vuoto. Altrimenti il
 * mouse, scendendo verso le voci, uscirebbe dall'elemento e la tendina si
 * chiuderebbe prima di poterci arrivare. Alla chiusura c'è anche un ritardo di
 * grazia: chi taglia in diagonale verso l'ultima voce della seconda colonna esce
 * per un istante dal riquadro, e non deve perdere il menu per così poco.
 * ----------------------------------------------------------------------- */

function LuminarieMenu({
  label,
  active,
  open,
  onOpenChange,
}: {
  label: string;
  active: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { locale, t } = useI18n();
  const menuId = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) onOpenChange(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, onOpenChange]);

  // Un solo timer per apertura e chiusura: chi parte annulla l'altro, così
  // entrare e uscire in fretta non lascia una chiusura in sospeso.
  const openWithDelay = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onOpenChange(true), 120);
  };

  const closeWithDelay = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onOpenChange(false), 180);
  };

  const closeNow = () => {
    if (timer.current) clearTimeout(timer.current);
    onOpenChange(false);
  };

  // Niente chiusure programmate dopo lo smontaggio.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <div
      ref={container}
      className="relative"
      onMouseEnter={openWithDelay}
      onMouseLeave={closeWithDelay}
      onFocus={() => onOpenChange(true)}
      onBlur={(event) => {
        // Con Tab si esce dalla tendina: va chiusa, come farebbe il mouse.
        if (!container.current?.contains(event.relatedTarget)) closeNow();
      }}
    >
      <Link
        href={localePath(locale, routes.luminarie)}
        aria-current={active ? 'page' : undefined}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(event) => {
          // Sul touch il primo tocco apre la tendina invece di navigare.
          if (window.matchMedia('(hover: none)').matches && !open) {
            event.preventDefault();
            onOpenChange(true);
          }
        }}
        className={cn(
          'flex items-center gap-5 transition-colors duration-200 ease-out hover:text-gold',
          (active || open) && 'text-gold',
        )}
      >
        {label}
        <span aria-hidden="true" className={cn('text-9', !active && !open && 'text-ink-3')}>
          {open ? '▲' : '▼'}
        </span>
      </Link>

      {open && (
        // L'involucro è trasparente e comincia subito sotto la voce: i 14px di
        // stacco stanno qui dentro, quindi il mouse che scende non esce mai.
        <div className="absolute top-full left-0 z-40 pt-14">
          <div
            id={menuId}
            className="flex gap-40 border border-hairline bg-panel-ime px-30 py-26"
          >
            {seasons.map((season) => (
              <div key={season} className="min-w-160">
                <Link
                  href={localePath(locale, `${routes.luminarie}?stagione=${season}`)}
                  className="font-body text-12 tracking-22 text-gold transition-colors duration-200 hover:text-gold-hover"
                >
                  {t.nav.seasons[season].toUpperCase()}
                </Link>
                <ul className="mt-14 flex flex-col gap-10">
                  {typesForSeason(season).map((type) => (
                    <li key={type.slug}>
                      <Link
                        href={localePath(
                          locale,
                          `${routes.luminarie}?stagione=${season}&tipologia=${type.slug}`,
                        )}
                        className="font-body text-14 font-medium text-ink-2 transition-colors duration-200 hover:text-gold"
                      >
                        {type.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Pannello mobile
 * ----------------------------------------------------------------------- */

function MobileNav({
  items,
  isActive,
  onNavigate,
}: {
  items: { href: string; label: string; hasMenu?: boolean; hasBadge?: boolean }[];
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const { locale, t } = useI18n();

  return (
    <div
      id="menu-mobile"
      className="absolute inset-x-0 top-full z-40 max-h-[calc(100vh-70px)] overflow-y-auto border-b border-hairline bg-night px-24 py-24 md:hidden"
    >
      <nav aria-label={t.nav.mainNav}>
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.href} className="border-b border-hairline last:border-b-0">
              <Link
                href={localePath(locale, item.href)}
                onClick={onNavigate}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-10 py-16 font-body text-16 text-nav',
                  isActive(item.href) && 'text-gold',
                )}
              >
                {item.label}
                {item.hasBadge && <RequestBadge />}
              </Link>
              {item.hasMenu && (
                <ul className="mb-14 flex flex-wrap gap-x-18 gap-y-10">
                  {seasons.map((season) => (
                    <li key={season}>
                      <Link
                        href={localePath(locale, `${routes.luminarie}?stagione=${season}`)}
                        onClick={onNavigate}
                        className="font-body text-12 tracking-20 text-ink-3"
                      >
                        {t.nav.seasons[season].toUpperCase()}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Switch di lingua e contatore della richiesta
 * ----------------------------------------------------------------------- */

/**
 * Porta alla stessa pagina nell'altra lingua. Non trascina la querystring:
 * leggerla qui costringerebbe l'header fuori dal rendering statico, e i filtri
 * si riapplicano in un clic.
 */
function LocaleSwitch() {
  const { locale } = useI18n();
  const pathname = usePathname();
  const bare = stripLocale(pathname ?? '/');

  return (
    <div className="flex items-center gap-2 font-body text-11-5 font-medium tracking-06">
      {locales.map((value: Locale) => {
        const active = value === locale;
        return (
          <Link
            key={value}
            href={localePath(value, bare)}
            hrefLang={value}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'rounded-pill px-8 py-3 transition-colors duration-200 ease-out',
              active ? 'border border-gold text-gold' : 'text-ink-3 hover:text-gold',
            )}
          >
            {value.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Il mockup non disegna il contatore della richiesta multipla: il README chiede
 * di proporlo. Qui è una pastiglia oro accanto a "Soggetti personalizzati",
 * che compare solo quando c'è almeno un soggetto selezionato.
 */
function RequestBadge() {
  const { t } = useI18n();
  const { items, ready } = useQuoteRequest();

  if (!ready || items.length === 0) return null;

  return (
    <span className="inline-flex min-w-18 items-center justify-center rounded-pill bg-gold px-6 py-1 font-body text-10-5 font-semibold text-gold-ink">
      {items.length}
      <span className="sr-only">
        {' '}
        {items.length === 1 ? t.subject.requestBadgeOne : t.subject.requestBadge}
      </span>
    </span>
  );
}
