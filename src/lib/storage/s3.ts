import 'server-only';
import { createHash, createHmac } from 'node:crypto';
import type { StorageDriver } from './types';

/**
 * Driver S3 (o qualsiasi servizio S3-compatibile: MinIO, R2, Backblaze…).
 *
 * Firma le richieste con SigV4 a mano invece di trascinarsi dietro l'SDK AWS:
 * serve una sola operazione, PutObject, e questo evita ~15 MB di dipendenze.
 * Per usarlo basta STORAGE_DRIVER="s3" e le variabili S3_*.
 */

type S3Config = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

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
    publicBaseUrl: (process.env.S3_PUBLIC_BASE_URL ?? '').replace(/\/$/, ''),
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

function signingKey(secret: string, date: string, region: string, service: string): Buffer {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function encodeKey(key: string): string {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export const s3Driver: StorageDriver = {
  async put({ folder, fileName, mimeType, data }) {
    const config = readConfig();
    const key = `${folder}/${fileName}`;
    const encoded = encodeKey(key);

    const url = new URL(`${config.endpoint}/${config.bucket}/${encoded}`);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
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
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      scope,
      sha256(canonicalRequest),
    ].join('\n');

    const signature = createHmac('sha256', signingKey(config.secretAccessKey, dateStamp, config.region, 's3'))
      .update(stringToSign, 'utf8')
      .digest('hex');

    const authorization =
      `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: authorization,
        'Content-Type': mimeType,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
      },
      body: new Uint8Array(data),
    });

    if (!response.ok) {
      throw new Error(`Upload su S3 non riuscito (${response.status}).`);
    }

    const base = config.publicBaseUrl || `${config.endpoint}/${config.bucket}`;
    return { key, url: `${base}/${encoded}` };
  },
};
