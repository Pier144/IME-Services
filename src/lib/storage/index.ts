import 'server-only';
import { randomUUID } from 'node:crypto';
import { localDriver } from './local';
import { s3Driver } from './s3';
import type { StorageDriver, StoredFile, UploadFolder } from './types';
import { slugify } from '@/lib/utils';

/**
 * Storage degli allegati.
 * Il driver si sceglie con STORAGE_DRIVER: "local" (default) o "s3".
 * Il resto dell'applicazione non sa quale sia attivo.
 */
function driver(): StorageDriver {
  return process.env.STORAGE_DRIVER === 's3' ? s3Driver : localDriver;
}

export function isLocalStorage(): boolean {
  return process.env.STORAGE_DRIVER !== 's3';
}

export function readLocalFile(key: string) {
  return localDriver.read?.(key) ?? Promise.resolve(null);
}

/** Link temporaneo verso il bucket privato. `null` con lo storage locale. */
export function signedUrlFor(key: string): Promise<string> | null {
  const active = driver();
  return active.signedUrl ? active.signedUrl(key) : null;
}

/** Nome di file prevedibile e sicuro: `slug-del-nome-<uuid>.ext`. */
function safeFileName(original: string): string {
  const lastDot = original.lastIndexOf('.');
  const base = lastDot > 0 ? original.slice(0, lastDot) : original;
  const extension = lastDot > 0 ? original.slice(lastDot + 1).toLowerCase() : '';
  const cleanExtension = extension.replace(/[^a-z0-9]/g, '').slice(0, 8);
  const cleanBase = slugify(base) || 'file';
  return cleanExtension ? `${cleanBase}-${randomUUID()}.${cleanExtension}` : `${cleanBase}-${randomUUID()}`;
}

export async function storeUpload(file: File, folder: UploadFolder): Promise<StoredFile> {
  const data = Buffer.from(await file.arrayBuffer());
  const fileName = safeFileName(file.name || 'allegato');
  const mimeType = file.type || 'application/octet-stream';

  const { key, url } = await driver().put({ folder, fileName, mimeType, data });

  return {
    name: file.name || fileName,
    size: file.size,
    mimeType,
    key,
    url,
    uploadedAt: new Date().toISOString(),
  };
}

export type { StoredFile, UploadFolder };
