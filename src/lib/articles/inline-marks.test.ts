import { describe, expect, it } from 'vitest';
import { applyLink, toggleMark } from './inline-marks';
import { stripMarks } from './body';

/** Applica un marcatore a `[parola]` dentro `testo`, come farebbe la barra. */
function suSelezione(testo: string, parola: string, mark: 'bold' | 'italic' | 'underline') {
  const start = testo.indexOf(parola);
  return toggleMark(testo, start, start + parola.length, mark);
}

describe('toggleMark', () => {
  it('mette i marcatori attorno alla selezione', () => {
    expect(suSelezione('una parola sola', 'parola', 'bold').value).toBe('una **parola** sola');
    expect(suSelezione('una parola sola', 'parola', 'italic').value).toBe('una *parola* sola');
    expect(suSelezione('una parola sola', 'parola', 'underline').value).toBe('una __parola__ sola');
  });

  it('lascia la selezione sul testo, non sui marcatori', () => {
    const risultato = suSelezione('una parola sola', 'parola', 'bold');
    expect(risultato.value.slice(risultato.start, risultato.end)).toBe('parola');
  });

  it('li toglie se ci sono già, con la selezione dentro', () => {
    expect(suSelezione('una **parola** sola', 'parola', 'bold').value).toBe('una parola sola');
  });

  it('li toglie anche se la selezione li comprende', () => {
    const testo = 'una **parola** sola';
    const start = testo.indexOf('**');
    expect(toggleMark(testo, start, start + '**parola**'.length, 'bold').value).toBe(
      'una parola sola',
    );
  });

  it('non trasforma il grassetto in corsivo mangiandogli un asterisco', () => {
    // Il caso che rompe l'implementazione ingenua: `*` è anche metà di `**`.
    const risultato = suSelezione('una **parola** sola', 'parola', 'italic');
    expect(risultato.value).toBe('una ***parola*** sola');
    expect(stripMarks(risultato.value)).toBe('una parola sola');
  });

  it('senza selezione non cambia niente', () => {
    expect(toggleMark('una parola', 4, 4, 'bold')).toEqual({ value: 'una parola', start: 4, end: 4 });
  });
});

describe('applyLink', () => {
  it('trasforma la selezione in link', () => {
    const testo = 'scrivi al comune';
    const start = testo.indexOf('comune');
    expect(applyLink(testo, start, start + 'comune'.length, 'https://esempio.it').value).toBe(
      'scrivi al [comune](https://esempio.it)',
    );
  });

  it('senza selezione usa l’indirizzo anche come testo', () => {
    expect(applyLink('vedi ', 5, 5, 'https://esempio.it').value).toBe(
      'vedi [https://esempio.it](https://esempio.it)',
    );
  });

  it('con un indirizzo vuoto non fa niente', () => {
    expect(applyLink('una parola', 0, 3, '   ').value).toBe('una parola');
  });

  it('produce un link che stripMarks sa ridurre al testo', () => {
    const risultato = applyLink('vedi il comune', 8, 14, 'https://esempio.it');
    expect(stripMarks(risultato.value)).toBe('vedi il comune');
  });
});
