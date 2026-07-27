import type { Metadata, Viewport } from 'next';
import { site } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.shortName} · luminarie artistiche e impianti elettrici`,
    template: `%s | ${site.shortName}`,
  },
  description:
    'Dal 2014 a Domegliara (VR): luminarie artistiche per città ed eventi, impianti elettrici civili e industriali.',
  applicationName: site.shortName,
  authors: [{ name: site.legalName }],
  formatDetection: { telephone: true, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: '#0a0e1c',
  colorScheme: 'dark',
};

/**
 * Layout radice "di passaggio".
 *
 * `<html>` e `<body>` non stanno qui ma nei due layout sottostanti, quello
 * della lingua (`[locale]/layout.tsx`) e quello dell'area riservata
 * (`admin/layout.tsx`), perché è lì che si conosce il valore giusto di `lang`
 * e la cornice della pagina. Qui restano solo i metadati comuni.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
