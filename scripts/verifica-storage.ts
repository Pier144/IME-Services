/**
 * Verifica che lo storage configurato funzioni davvero.
 *
 *   npm run check:storage
 *
 * Serve prima di mettere le variabili su Netlify: se qui non passa, in
 * produzione ogni caricamento fallisce e lo si scopre da un curriculum perso.
 *
 * Fa il giro completo che fa l'applicazione: scrive un oggetto, ne chiede un
 * link firmato, lo scarica e confronta il contenuto. Un `PUT` riuscito da solo
 * non basterebbe — dice che le chiavi scrivono, non che i file si rileggano.
 */
import { randomUUID } from 'node:crypto';

async function main() {
  const driver = process.env.STORAGE_DRIVER ?? 'local';
  console.log(`STORAGE_DRIVER = ${driver}`);

  if (driver !== 's3') {
    console.log(
      '\nDriver locale: i file finiscono in ' +
        (process.env.STORAGE_LOCAL_DIR ?? './storage/uploads') +
        '.\nVa bene in sviluppo, ma NON in produzione: su Netlify il disco e di sola\n' +
        'lettura e ogni caricamento fallisce. Metti STORAGE_DRIVER="s3" e riprova.',
    );
    return;
  }

  const attese = ['S3_ENDPOINT', 'S3_REGION', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'];
  const mancanti = attese.filter((nome) => !process.env[nome]);
  if (mancanti.length > 0) {
    console.error(`\nMancano le variabili: ${mancanti.join(', ')}`);
    process.exit(1);
  }

  console.log(`endpoint = ${process.env.S3_ENDPOINT}`);
  console.log(`bucket   = ${process.env.S3_BUCKET}`);
  console.log(`region   = ${process.env.S3_REGION}  (su R2 deve essere "auto")`);

  // Importato qui e non in cima: il modulo legge la configurazione all'uso, e
  // vogliamo che i controlli sopra parlino prima di qualunque errore suo.
  const { s3Driver } = await import('../src/lib/storage/s3');

  const contenuto = `verifica storage ${randomUUID()}`;
  const nome = `verifica-${randomUUID()}.txt`;

  console.log('\n1. scrittura...');
  const { key } = await s3Driver.put({
    folder: 'articoli',
    fileName: nome,
    mimeType: 'text/plain',
    data: Buffer.from(contenuto, 'utf8'),
  });
  console.log(`   scritto: ${key}`);

  console.log('2. link firmato...');
  const url = await s3Driver.signedUrl!(key);
  console.log(`   ottenuto (scade fra 5 minuti)`);

  console.log('3. rilettura...');
  const risposta = await fetch(url);
  if (!risposta.ok) {
    console.error(`   FALLITO: il link firmato risponde ${risposta.status}`);
    process.exit(1);
  }
  const riletto = await risposta.text();
  if (riletto !== contenuto) {
    console.error('   FALLITO: il contenuto riletto non corrisponde a quello scritto');
    process.exit(1);
  }
  console.log('   contenuto identico');

  console.log('4. il bucket e privato?');
  const nudo = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
  const senzaFirma = await fetch(nudo).catch(() => null);
  if (senzaFirma && senzaFirma.ok) {
    console.error(
      '   ATTENZIONE: il file si scarica SENZA firma. Il bucket e pubblico.\n' +
        '   Curriculum e allegati ai preventivi sono dati personali e non devono\n' +
        '   stare a indirizzi indovinabili. Rendi privato il bucket.',
    );
    process.exit(1);
  }
  console.log(`   si: senza firma risponde ${senzaFirma ? senzaFirma.status : 'errore di rete'}`);

  console.log(`\nOK — lo storage funziona.\nPuoi cancellare l'oggetto di prova: ${key}`);
}

main().catch((errore: unknown) => {
  console.error('\nFALLITO:', errore instanceof Error ? errore.message : errore);
  process.exit(1);
});
