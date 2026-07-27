import { NextResponse } from 'next/server';
import { isLocalStorage, readLocalFile, signedUrlFor } from '@/lib/storage';
import { isProtectedKey } from '@/lib/storage/types';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Unico varco verso gli allegati.
 *
 * Il bucket è privato e i file non hanno mai un indirizzo pubblico: si passa
 * sempre da qui, che prima controlla chi sta chiedendo e poi serve il file —
 * dal disco con lo storage locale, con un link firmato a scadenza con S3.
 *
 * Le copertine degli articoli sono pubbliche perché stanno sul sito pubblico.
 * Disegni allegati alle richieste e curriculum no: sono dati personali e
 * richiedono una sessione dell'area riservata.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const path = key.join('/');

  if (isProtectedKey(path) && !(await getSession())) {
    // 404 e non 401: a chi non ha titolo non si conferma nemmeno che il file esista.
    return new NextResponse('Not found', { status: 404 });
  }

  if (!isLocalStorage()) {
    const signed = signedUrlFor(path);
    if (!signed) return new NextResponse('Not found', { status: 404 });
    return NextResponse.redirect(await signed, {
      status: 307,
      headers: { 'Cache-Control': 'private, max-age=60' },
    });
  }

  const file = await readLocalFile(path);
  if (!file) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.mimeType,
      'Cache-Control': isProtectedKey(path)
        ? 'private, no-store'
        : 'public, max-age=3600',
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
