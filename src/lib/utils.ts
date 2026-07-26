/** Compone className condizionali senza dipendenze esterne. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Slug URL-safe da un titolo italiano (accenti inclusi). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // toglie i segni diacritici combinanti
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Byte → "2,4 MB" con la virgola decimale italiana. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

/** Divide un array in pagine da `perPage` elementi (1-based). */
export function paginate<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: current,
    totalPages,
    total: items.length,
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + perPage, items.length),
  };
}

/** Legge un parametro di querystring che Next può consegnare come array. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
