/**
 * Stagioni e tipologie del catalogo luminarie.
 * Le tipologie sono quelle disegnate nel mockup 2a più quelle necessarie a
 * coprire il tab "Eventi", che nel mockup non è stato declinato.
 */

export const seasons = ['natalizie', 'eventi'] as const;
export type Season = (typeof seasons)[number];

export type SubjectType = {
  slug: string;
  name: string;
  /** Le maiuscole spaziate sotto il nome nelle card. */
  display: string;
  seasons: readonly Season[];
};

export const subjectTypes: readonly SubjectType[] = [
  {
    slug: 'alberi-di-natale',
    name: 'Alberi di Natale',
    display: 'ALBERI DI NATALE',
    seasons: ['natalizie'],
  },
  {
    slug: 'attraversamenti-stradali',
    name: 'Attraversamenti stradali',
    display: 'ATTRAVERSAMENTI STRADALI',
    seasons: ['natalizie', 'eventi'],
  },
  {
    slug: 'sospensioni',
    name: 'Sospensioni',
    display: 'SOSPENSIONI',
    seasons: ['natalizie', 'eventi'],
  },
  {
    slug: 'facciate-e-portali',
    name: 'Facciate e portali',
    display: 'FACCIATE E PORTALI',
    seasons: ['natalizie', 'eventi'],
  },
  {
    slug: 'soggetti-3d',
    name: 'Soggetti 3D',
    display: 'SOGGETTI 3D',
    seasons: ['natalizie', 'eventi'],
  },
  {
    slug: 'zucche-di-halloween',
    name: 'Zucche di Halloween',
    display: 'ZUCCHE DI HALLOWEEN',
    seasons: ['eventi'],
  },
  {
    slug: 'scritte-luminose',
    name: 'Scritte luminose',
    display: 'SCRITTE LUMINOSE',
    seasons: ['eventi'],
  },
  {
    slug: 'allestimenti-evento',
    name: 'Allestimenti per eventi',
    display: 'ALLESTIMENTI PER EVENTI',
    seasons: ['eventi'],
  },
];

export function getSubjectType(slug: string): SubjectType | undefined {
  return subjectTypes.find((type) => type.slug === slug);
}

export function typesForSeason(season: Season): readonly SubjectType[] {
  return subjectTypes.filter((type) => type.seasons.includes(season));
}

/**
 * I nomi delle stagioni sono interfaccia, non contenuto: stanno nei dizionari
 * (`t.nav.seasons`) e si scrivono in maiuscolo dove serve. Qui restano solo gli
 * slug, che sono gli stessi in tutte le lingue perché finiscono in querystring.
 */
