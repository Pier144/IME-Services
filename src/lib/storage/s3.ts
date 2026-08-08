import 'server-only';
import { createHash, createHmac } from 'node:crypto';
import type { StorageDriver } from './types';

/**
 * Driver S3, usato con Cloudflare R2, che espone un endpoint S3-compatibile
 * con firma SigV4. Funziona identico con MinIO, Scaleway o S3 vero: cambiano
 * solo le variabili `S3_*`. Su R2 la regione è sempre "auto".
 *
 * Firma le richieste a mano invece di trascinarsi dietro l'SDK AWS: servono
 * due sole operazioni, PutObject e la firma di un GET, e questo evita ~15 MB
 * di dipendenze in un progetto che non ne ha bisogno.
 *
 * **Il bucket va tenuto privato.** Nessun file viene mai restituito con un URL
 * pubblico: `put` registra la chiave, e chi la richiede passa da
 * `/api/media/<chiave>`, che controlla i permessi e poi rimanda a un link
 * firmato che scade. Vale soprattutto per curriculum e disegni allegati, che
 * sono dati personali e non devono stare su indirizzi indovinabili.
 */

type S3Config = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
};

/** Quanto vive un link firmato. Corto: serve solo a scaricare il file. */
const SIGNED_URL_TTL_SECONDS = 300;

function readConfig(): S3Config {
  const missing: string[] = [];
  const read = (name: string) => {
    const value = process.env[name];
    if (!value) missing.push(name);
    return value ?? '';
  };

  const config: S3Config = {
    endpoint: read('S3_ENDPOINT').replace(/\/$/, ''),
    region: read('S3_REGION'),
    bucket: read('S3_BUCKET'),
    accessKeyId: read('S3_ACCESS_KEY_ID'),
    secretAccessKey: read('S3_SECRET_ACCESS_KEY'),
  };

  if (missing.length > 0) {
    throw new Error(
      `STORAGE_DRIVER="s3" ma mancano le variabili: ${missing.join(', ')}. ` +
        'Completa il .env oppure torna a STORAGE_DRIVER="local".',
    );
  }

  return config;
}

function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}

function signingKey(secret: string, date: string, region: string): Buffer {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, 's3');
  return hmac(kService, 'aws4_request');
}

/** Codifica secondo RFC 3986, come pretende SigV4. */
function rfc3986(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeKey(key: string): string {
  return key.split('/').map(rfc3986).join('/');
}

/** "20260727T084500Z" e "20260727" */
function stamps() {
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
}

export const s3Driver: StorageDriver = {
  async put({ folder, fileName, mimeType, data }) {
    const config = readConfig();
    const key = `${folder}/${fileName}`;
    const url = new URL(`${config.endpoint}/${config.bucket}/${encodeKey(key)}`);
    const { amzDate, dateStamp } = stamps();
    const payloadHash = sha256(data);

    const canonicalHeaders =
      `content-type:${mimeType}\n` +
      `host:${url.host}\n` +
      `x-amz-content-sha256:${payloadHash}\n` +
      `x-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      'PUT',
      url.pathname,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const scope = `${dateStamp}/${config.region}/s3/aws4_request`;
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');

    const signature = createHmac('sha256', signingKey(config.secretAccessKey, dateStamp, config.region))
      .update(stringToSign, 'utf8')
      .digest('hex');

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization:
          `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, ` +
          `SignedHeaders=${signedHeaders}, Signature=${signature}`,
        'Content-Type': mimeType,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
      },
      body: new Uint8Array(data),
    });

    if (!response.ok) {
      throw new Error(`Upload sullo storage non riuscito (${response.status}).`);
    }

    // Mai un URL pubblico: si passa sempre dal nostro controllo accessi.
    return { key, url: `/api/media/${key}` };
  },

  /**
   * Link temporaneo per scaricare un oggetto: firma SigV4 messa in
   * querystring, valida cinque minuti. Il bucket resta privato.
   */
  async signedUrl(key) {
    const config = readConfig();
    const url = new URL(`${config.endpoint}/${config.bucket}/${encodeKey(key)}`);
    const { amzDate, dateStamp } = stamps();
    const scope = `${dateStamp}/${config.region}/s3/aws4_request`;

    const params: Record<string, string> = {
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${config.accessKeyId}/${scope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(SIGNED_URL_TTL_SECONDS),
      'X-Amz-SignedHeaders': 'host',
    };

    const canonicalQuery = Object.keys(params)
      .sort()
      .map((name) => `${rfc3986(name)}=${rfc3986(params[name])}`)
      .join('&');

    const canonicalRequest = [
      'GET',
      url.pathname,
      canonicalQuery,
      `host:${url.host}\n`,
      'host',
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');

    const signature = createHmac('sha256', signingKey(config.secretAccessKey, dateStamp, config.region))
      .update(stringToSign, 'utf8')
      .digest('hex');

    return `${url.origin}${url.pathname}?${canonicalQuery}&X-Amz-Signature=${signature}`;
  },
};
