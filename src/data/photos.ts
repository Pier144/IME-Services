/**
 * FOTOGRAFIE: MATERIALE PROVVISORIO
 *
 * Sono immagini stock di Pexels (licenza gratuita anche per uso commerciale,
 * senza obbligo di attribuzione) scelte una per una per avvicinarsi al brief
 * fotografico scritto nei mockup. Servono a far vedere il sito "pieno": non
 * ritraggono lavori di IME Service e vanno sostituite dalle foto reali
 * dell'azienda prima del go-live.
 *
 * L'elenco delle fonti e delle foto ancora mancanti sta in CREDITI-FOTO.md.
 *
 * Come sostituirle: si mette la foto vera in `public/foto/` con lo stesso nome
 * e non si tocca nient'altro. Gli slot che qui valgono `null` restano
 * segnaposto tratteggiati con l'etichetta del brief, che è il modo giusto di
 * mostrare al cliente quali foto mancano ancora.
 */

const base = '/foto';

export const photos = {
  /** Le quattro slide dell'hero della home, nell'ordine del mockup 1a. */
  homeHero: [
    `${base}/hero-luminarie-citta.jpg`,
    `${base}/hero-evento-estivo.jpg`,
    `${base}/hero-quadro-elettrico.jpg`,
    `${base}/hero-officina.jpg`,
  ],

  /** Fasce-foto di apertura delle pagine interne. */
  pageHero: {
    luminarie: `${base}/hero-luminarie-citta.jpg`,
    about: `${base}/hero-officina.jpg`,
    careers: `${base}/squadra-cestello.jpg`,
    impianti: `${base}/quadro-magnetotermici.jpg`,
    custom: `${base}/saldatura-dettaglio.jpg`,
  },

  /** Chi siamo → "DOVE LAVORIAMO", nell'ordine del dizionario. */
  aboutPlaces: [
    `${base}/hero-officina.jpg`,
    `${base}/magazzino.jpg`,
    // "I mezzi": nessuna foto stock utilizzabile senza il marchio di un'altra
    // azienda sui furgoni. Resta il segnaposto, in attesa della foto reale.
    null,
  ],

  /** Impianti → "COSA FACCIAMO", nell'ordine del dizionario. */
  impiantiServices: [
    `${base}/impianto-civile.jpg`,
    `${base}/hero-evento-estivo.jpg`,
    `${base}/facciata-illuminata.jpg`,
  ],

  /** Soggetti personalizzati: la foto della colonna di destra. */
  customAside: `${base}/portale-dorato.jpg`,

  /** Lavora con noi: la foto accanto al form di candidatura. */
  careersForm: `${base}/saldatura-dettaglio.jpg`,

  /** Copertine degli articoli, per slug. */
  articles: {
    'natale-verona-piazza-bra': `${base}/sospensioni-angeli.jpg`,
    'zucche-luminose-collezione-halloween': `${base}/zucche-halloween.jpg`,
    'impianto-luci-studio-televisivo-telearena': `${base}/facciata-illuminata.jpg`,
    'impianti-noleggio-estate-sagre-venete': `${base}/hero-evento-estivo.jpg`,
    'come-nasce-un-soggetto-su-misura': `${base}/saldatura-dettaglio.jpg`,
    'cerchiamo-elettricisti-la-squadra-si-allarga': `${base}/squadra-cestello.jpg`,
    'accensione-natale-bussolengo': `${base}/piazza-mercatino.jpg`,
    'luminarie-a-basso-consumo': `${base}/via-alberata-luci.jpg`,
    'nuovo-magazzino-domegliara': `${base}/magazzino.jpg`,
    'illuminazione-facciata-cantina-valpolicella': `${base}/facciata-illuminata.jpg`,
    'sicurezza-lavori-in-quota': `${base}/squadra-cestello.jpg`,
    'progetto-luci-mercatino-natale': `${base}/piazza-mercatino.jpg`,
    'natale-2026-si-progetta-in-primavera': `${base}/attraversamento-festoni.jpg`,
    'nuovo-catalogo-soggetti': `${base}/albero-piazza.jpg`,
  } as Record<string, string>,

  /** Soggetti a catalogo, per slug. Chi non compare resta segnaposto. */
  subjects: {
    'albero-galassia': `${base}/albero-piazza.jpg`,
    'albero-del-borgo': `${base}/vicolo-borgo.jpg`,
    'onda-di-stelle': `${base}/attraversamento-festoni.jpg`,
    'archi-di-natale': `${base}/archi-luminosi.jpg`,
    'ghirlanda-di-corso': `${base}/via-alberata-luci.jpg`,
    'cielo-di-verona': `${base}/sospensioni-angeli.jpg`,
    'tunnel-di-luce': `${base}/tunnel-di-luce.jpg`,
    'portale-reale': `${base}/portale-dorato.jpg`,
    'facciata-a-pioggia': `${base}/facciata-illuminata.jpg`,
    'renna-aurora': `${base}/renna-geometrica.jpg`,
    'zucca-lanterna': `${base}/zucche-halloween.jpg`,
    'zucca-sorridente': `${base}/zucche-halloween.jpg`,
    'bandierine-di-luce': `${base}/hero-evento-estivo.jpg`,
    'scritta-buone-feste': `${base}/piazza-mercatino.jpg`,
  } as Record<string, string>,
} as const;

/** La foto di catalogo di un soggetto, oppure null se manca ancora. */
export function subjectPhoto(slug: string): string | null {
  return photos.subjects[slug] ?? null;
}

/** La copertina di un articolo del seed, oppure null. */
export function articleCover(slug: string): string | null {
  return photos.articles[slug] ?? null;
}
