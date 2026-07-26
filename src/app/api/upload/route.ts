import { NextResponse } from 'next/server';
import { storeUpload, type UploadFolder } from '@/lib/storage';
import { uploadLimits } from '@/lib/site';
import { clientKey, rateLimit } from '@/lib/rate-limit';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Caricamento allegati.
 *
 * `attachment` e `cv` servono ai form pubblici, quindi l'endpoint è aperto ma
 * limitato per indirizzo. `cover` è l'immagine di copertina degli articoli e
 * richiede una sessione dell'area riservata.
 *
 * Dimensione ed estensione vengono ricontrollate qui: quello che dichiara il
 * browser non fa testo.
 */

const KINDS = {
  attachment: { limits: uploadLimits.attachment, folder: 'preventivi' as UploadFolder },
  cv: { limits: uploadLimits.cv, folder: 'candidature' as UploadFolder },
  cover: { limits: uploadLimits.cover, folder: 'copertine' as UploadFolder },
} as const;

type Kind = keyof typeof KINDS;

function isKind(value: string): value is Kind {
  return value in KINDS;
}

export async function POST(request: Request) {
  const limiter = rateLimit(clientKey(request, 'upload'), { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Troppi caricamenti ravvicinati. Riprova fra qualche minuto.' },
      { status: 429, headers: { 'Retry-After': String(limiter.retryAfterSeconds) } },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 });
  }

  const kindValue = String(form.get('kind') ?? '');
  if (!isKind(kindValue)) {
    return NextResponse.json({ error: 'Tipo di caricamento non riconosciuto.' }, { status: 400 });
  }

  if (kindValue === 'cover') {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Accesso richiesto.' }, { status: 401 });
    }
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Nessun file ricevuto.' }, { status: 400 });
  }

  const { limits, folder } = KINDS[kindValue];

  if (file.size > limits.maxBytes) {
    return NextResponse.json(
      { error: `Il file supera il limite di ${Math.round(limits.maxBytes / (1024 * 1024))} MB.` },
      { status: 413 },
    );
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const extensionOk = (limits.extensions as readonly string[]).includes(extension);
  const mimeOk = file.type === '' || (limits.mimeTypes as readonly string[]).includes(file.type);

  if (!extensionOk || !mimeOk) {
    return NextResponse.json(
      { error: `Formato non ammesso. Accettiamo: ${limits.extensions.join(', ')}.` },
      { status: 415 },
    );
  }

  try {
    const stored = await storeUpload(file, folder);
    return NextResponse.json(stored, { status: 201 });
  } catch (error) {
    console.error('[upload] salvataggio non riuscito', error);
    return NextResponse.json({ error: 'Caricamento non riuscito. Riprova.' }, { status: 500 });
  }
}
