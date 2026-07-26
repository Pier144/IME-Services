/** Un file caricato, come viene salvato nel database e mostrato nei form. */
export type StoredFile = {
  /** Nome originale, quello che vede l'utente. */
  name: string;
  size: number;
  mimeType: string;
  /** Chiave interna dello storage (percorso relativo o oggetto S3). */
  key: string;
  /** URL con cui il file si scarica. */
  url: string;
  uploadedAt: string;
};

export type UploadFolder = 'preventivi' | 'candidature' | 'copertine' | 'articoli';

export interface StorageDriver {
  put(input: {
    folder: UploadFolder;
    fileName: string;
    mimeType: string;
    data: Buffer;
  }): Promise<{ key: string; url: string }>;
  /** Solo il driver locale: serve al route handler che restituisce il file. */
  read?(key: string): Promise<{ data: Buffer; mimeType: string } | null>;
}

export function parseStoredFiles(raw: string | null | undefined): StoredFile[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredFile);
  } catch {
    return [];
  }
}

export function isStoredFile(value: unknown): value is StoredFile {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Record<string, unknown>;
  return (
    typeof file.name === 'string' &&
    typeof file.size === 'number' &&
    typeof file.key === 'string' &&
    typeof file.url === 'string'
  );
}
