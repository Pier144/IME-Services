import type it from './dictionaries/it';

/**
 * Allarga i tipi letterali prodotti da `as const` mantenendo la forma.
 * Serve perché il dizionario italiano è la fonte della struttura, ma quello
 * inglese deve poter contenere stringhe diverse (non i literal dell'italiano).
 * Gli array restano `readonly` così anche il dizionario italiano è assegnabile.
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : T extends object
          ? { readonly [K in keyof T]: Widen<T[K]> }
          : T;

/** La forma del dizionario: la definisce l'italiano, la rispettano tutte le lingue. */
export type Dictionary = Widen<typeof it>;
