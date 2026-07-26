/**
 * Categorie delle news.
 * `tone` decide il colore dell'occhiello: blu = mondo impianti/città,
 * rosa = mondo Fabbrica (README: «Categoria "La Fabbrica" usa `rose` invece di
 * `blue-lt`»).
 */
export type NewsCategory = {
  slug: string;
  name: string;
  display: string;
  tone: 'blue' | 'rose';
};

export const newsCategories: readonly NewsCategory[] = [
  { slug: 'natale-in-citta', name: 'Natale in città', display: 'NATALE IN CITTÀ', tone: 'blue' },
  { slug: 'collezioni', name: 'Collezioni', display: 'COLLEZIONI', tone: 'blue' },
  { slug: 'progetti', name: 'Progetti', display: 'PROGETTI', tone: 'blue' },
  { slug: 'la-fabbrica', name: 'La Fabbrica', display: 'LA FABBRICA', tone: 'rose' },
  { slug: 'azienda', name: 'Azienda', display: 'AZIENDA', tone: 'blue' },
];

export function getNewsCategory(slug: string): NewsCategory | undefined {
  return newsCategories.find((category) => category.slug === slug);
}

export function categoryDisplay(slug: string): string {
  return getNewsCategory(slug)?.display ?? slug.toUpperCase();
}

export function categoryName(slug: string): string {
  return getNewsCategory(slug)?.name ?? slug;
}
