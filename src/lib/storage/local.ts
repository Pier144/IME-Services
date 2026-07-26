import 'server-only';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { StorageDriver } from './types';

/**
 * Driver di sviluppo: i file finiscono sul filesystem, in una cartella fuori da
 * `public/`. Vengono restituiti da `/api/media/<chiave>`, così il percorso su
 * disco non è mai indovinabile dall'esterno.
 */

/** Radice dello storage, risolta una volta sola all'avvio. */
function root(): string {
  return path.resolve(
    process.cwd(),
    /* turbopackIgnore: true */ process.env.STORAGE_LOCAL_DIR ?? './storage/uploads',
  );
}

/** Blocca ogni tentativo di uscire dalla cartella di storage. */
function resolveKey(key: string): string | null {
  const normalized = path
    .normalize(key)
    .replace(/^([/\\])+/, '')
    .replace(/\\/g, '/');
  if (normalized.split('/').some((segment) => segment === '..')) return null;
  const base = root();
  const full = path.resolve(base, normalized);
  const relative = path.relative(base, full);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return full;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.ai': 'application/postscript',
  '.dwg': 'image/vnd.dwg',
};

export const localDriver: StorageDriver = {
  async put({ folder, fileName, data }) {
    const key = `${folder}/${fileName}`;
    const full = resolveKey(key);
    if (!full) throw new Error('Chiave di storage non valida.');

    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);

    return { key, url: `/api/media/${key}` };
  },

  async read(key) {
    const full = resolveKey(key);
    if (!full) return null;
    try {
      const data = await readFile(full);
      const mimeType = MIME_BY_EXTENSION[path.extname(full).toLowerCase()] ?? 'application/octet-stream';
      return { data, mimeType };
    } catch {
      return null;
    }
  },
};
