import { NextResponse } from 'next/server';
import { isLocalStorage, readLocalFile } from '@/lib/storage';

export const runtime = 'nodejs';

/**
 * Restituisce gli allegati salvati dal driver locale.
 * Vivono fuori da `public/`, quindi il percorso su disco non è indovinabile e
 * un domani si può mettere un controllo d'accesso davanti a questa funzione.
 * Con lo storage S3 i file sono serviti direttamente dal bucket e questa rotta
 * non viene mai chiamata.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  if (!isLocalStorage()) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { key } = await params;
  const file = await readLocalFile(key.join('/'));

  if (!file) {
    return new NextResponse('Not found', { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.mimeType,
      'Cache-Control': 'private, max-age=3600',
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
