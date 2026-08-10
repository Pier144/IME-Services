/**
 * I marcatori in linea che `renderInline` già conosce, applicati a una
 * selezione di testo: **grassetto**, *corsivo*, __sottolineato__ e i link.
 *
 * Sono funzioni su stringhe e indici, non su elementi del DOM: la barra di
 * formattazione ci mette sopra i pulsanti, ma la regola sta qui e si prova
 * senza browser.
 */

export type InlineMark = 'bold' | 'italic' | 'underline';

const markers: Record<InlineMark, string> = {
  bold: '**',
  italic: '*',
  underline: '__',
};

/** Testo nuovo e selezione nuova: chi chiama rimette il cursore dov'era. */
export type MarkResult = { value: string; start: number; end: number };

/**
 * Il corsivo condivide il carattere con il grassetto: senza questo controllo,
 * togliere il corsivo a una parola dentro `**grassetto**` mangerebbe un
 * asterisco per lato e la trasformerebbe in corsivo.
 */
function isPartOfBold(value: string, start: number, end: number): boolean {
  return value.slice(start - 2, start) === '**' || value.slice(end, end + 2) === '**';
}

export function toggleMark(
  value: string,
  start: number,
  end: number,
  mark: InlineMark,
): MarkResult {
  if (start === end) return { value, start, end };

  const marker = markers[mark];
  const width = marker.length;
  const selected = value.slice(start, end);

  // I marcatori stanno appena fuori dalla selezione: si tolgono.
  const wrappedOutside =
    value.slice(start - width, start) === marker &&
    value.slice(end, end + width) === marker &&
    !(mark === 'italic' && isPartOfBold(value, start, end));

  if (wrappedOutside) {
    return {
      value: value.slice(0, start - width) + selected + value.slice(end + width),
      start: start - width,
      end: end - width,
    };
  }

  // I marcatori sono dentro la selezione: si tolgono lo stesso.
  const wrappedInside =
    selected.length >= width * 2 &&
    selected.startsWith(marker) &&
    selected.endsWith(marker) &&
    !(mark === 'italic' && selected.startsWith('**'));

  if (wrappedInside) {
    const nudo = selected.slice(width, selected.length - width);
    return { value: value.slice(0, start) + nudo + value.slice(end), start, end: start + nudo.length };
  }

  return {
    value: value.slice(0, start) + marker + selected + marker + value.slice(end),
    start: start + width,
    end: end + width,
  };
}

/**
 * Trasforma la selezione in un link.
 *
 * Senza selezione l'indirizzo diventa anche il testo: è il caso di chi incolla
 * un URL e si aspetta che diventi cliccabile.
 */
export function applyLink(value: string, start: number, end: number, href: string): MarkResult {
  const url = href.trim();
  if (!url) return { value, start, end };

  const text = value.slice(start, end) || url;
  const link = `[${text}](${url})`;

  return {
    value: value.slice(0, start) + link + value.slice(end),
    // La selezione si richiude sul testo, non sui marcatori: si continua a
    // scrivere da dopo il link.
    start: start + link.length,
    end: start + link.length,
  };
}
