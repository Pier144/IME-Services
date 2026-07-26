/**
 * Dati strutturati JSON-LD.
 *
 * Il JSON viene passato come testo figlio dello <script>: React lo scrive
 * senza toccarlo, quindi il documento resta valido. Prima però `<`, `>` e i due
 * separatori di riga Unicode (U+2028 e U+2029, che JSON ammette ma JavaScript
 * no) vengono sostituiti dalla forma escapata: anche se un titolo scritto in
 * redazione contenesse la chiusura di un tag, non potrebbe uscire dallo script.
 */

const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), 'g');
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), 'g');

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(LINE_SEPARATOR, '\\u2028')
    .replace(PARAGRAPH_SEPARATOR, '\\u2029');

  return <script type="application/ld+json">{json}</script>;
}
