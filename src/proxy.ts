import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale } from '@/i18n/config';

/**
 * Routing delle lingue.
 *
 * L'albero delle pagine vive tutto sotto `app/[locale]`, ma l'italiano non deve
 * mostrare il prefisso: `/luminarie` viene riscritto internamente su
 * `/it/luminarie`, mentre l'inglese resta esplicito su `/en/luminarie`.
 * Un eventuale `/it/...` digitato a mano viene ridotto alla forma canonica.
 *
 * Admin, API e asset non passano di qui.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // L'inglese è già nella sua forma finale.
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return NextResponse.next();
  }

  // `/it/qualcosa` → redirect permanente su `/qualcosa` (una sola URL canonica).
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || '/';
    return NextResponse.redirect(url, 308);
  }

  // Tutto il resto è italiano: riscrittura interna, l'URL nel browser non cambia.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Tutto tranne:
     * - /admin  (area riservata, solo italiano)
     * - /api    (route handler)
     * - /_next  (build output)
     * - file con estensione (favicon.ico, robots.txt, immagini…)
     */
    '/((?!admin|api|_next/static|_next/image|.*\\.[^/]*$).*)',
  ],
};
