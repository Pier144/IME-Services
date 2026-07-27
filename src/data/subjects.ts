import type { Season } from './subject-types';
import { subjectPhoto } from './photos';

/* ==========================================================================
 * CATALOGO SOGGETTI: DATI SEGNAPOSTO
 *
 * L'anagrafica reale non è ancora disponibile (design/README.md → "DA
 * COMPLETARE: anagrafica reale del catalogo soggetti"). Nomi, descrizioni,
 * schede tecniche e installazioni qui sotto sono plausibili e coerenti con il
 * mestiere dell'azienda, ma vanno sostituiti prima del go-live.
 *
 * Gli otto soggetti disegnati nel mockup 2a (Albero Galassia, Onda di Stelle,
 * Cielo di Verona, Portale Reale, Renna Aurora, Cometa, Tunnel di Luce, Sfera
 * Polare) e i quattro correlati del mockup 2b sono riportati con i nomi
 * originali.
 *
 * Le stringhe `photo` sono il brief fotografico per il cliente: descrivono la
 * foto che dovrà prendere il posto del segnaposto.
 * ======================================================================== */

export type SubjectSpecKey = 'heights' | 'source' | 'effects' | 'power' | 'formula';

export type SubjectSpec = { key: SubjectSpecKey; value: string };

export type GalleryShot = {
  /** Didascalia della miniatura. */
  caption: string;
  /** Brief fotografico. */
  photo: string;
  /** La foto vera, quando arriverà. */
  src?: string | null;
};

export type Installation = {
  place: string;
  meta: string;
  photo: string;
  src?: string | null;
};

export type Subject = {
  slug: string;
  name: string;
  /** Slug della tipologia, vedi subject-types.ts */
  type: string;
  seasons: readonly Season[];
  description: string;
  specs: readonly SubjectSpec[];
  /** Brief della foto usata nelle card di catalogo. */
  photo: string;
  src?: string | null;
  gallery: readonly GalleryShot[];
  installations: readonly Installation[];
};

type SubjectInput = {
  slug: string;
  name: string;
  type: string;
  seasons?: readonly Season[];
  description: string;
  heights: string;
  source: string;
  effects: string;
  power: string;
  formula?: string;
  /** Brief della foto di catalogo. */
  photo: string;
  /** Brief della foto principale nella scheda. */
  hero: string;
  /** Coppie [luogo, misura · stagione]. */
  installations: readonly (readonly [string, string])[];
};

function build(input: SubjectInput): Subject {
  // Dove esiste una foto, vale sia per la card sia per la prima vista della
  // galleria. Le altre tre viste restano segnaposto: di ogni soggetto abbiamo
  // una sola immagine, e fingere il contrario non aiuterebbe nessuno.
  const photo = subjectPhoto(input.slug);

  return {
    slug: input.slug,
    name: input.name,
    type: input.type,
    seasons: input.seasons ?? ['natalizie'],
    description: input.description,
    specs: [
      { key: 'heights', value: input.heights },
      { key: 'source', value: input.source },
      { key: 'effects', value: input.effects },
      { key: 'power', value: input.power },
      { key: 'formula', value: input.formula ?? 'Vendita o noleggio stagionale' },
    ],
    photo: input.photo,
    src: photo,
    gallery: [
      { caption: 'vista intera', photo: input.hero, src: photo },
      { caption: 'dettaglio LED', photo: `FOTO: ${input.name}: dettaglio del cablaggio LED` },
      { caption: 'di giorno', photo: `FOTO: ${input.name}: la struttura spenta, di giorno` },
      { caption: 'montaggio', photo: `FOTO: ${input.name}: la squadra durante il montaggio` },
    ],
    installations: input.installations.map(([place, meta]) => ({
      place,
      meta,
      photo: `FOTO: ${input.name} installato a ${place}, vista notturna`,
    })),
  };
}

export const subjects: readonly Subject[] = [
  /* --- Alberi di Natale ------------------------------------------------- */
  build({
    slug: 'albero-galassia',
    name: 'Albero Galassia',
    type: 'alberi-di-natale',
    description:
      'Struttura conica in alluminio rivestita da cascate di microled, con puntale a stella e accensioni programmabili. Per piazze e rotonde. Si monta in giornata.',
    heights: '4 m · 6 m · 8 m · 10 m',
    source: 'Microled 24V bianco caldo',
    effects: 'Fisso · cascata · scintillio',
    power: '230V · assorbimento 0,9 kW (6 m)',
    photo: 'FOTO: albero 6 m in piazza',
    hero: 'FOTO PRINCIPALE: Albero Galassia acceso in piazza, notturna, vista intera',
    installations: [
      ['Piazza Bra, Verona', '8 m · Natale 2025'],
      ['Domegliara', '6 m · Natale 2024'],
      ['Rotonda SP11', '10 m · Natale 2024'],
    ],
  }),
  build({
    slug: 'albero-spirale',
    name: 'Albero Spirale',
    type: 'alberi-di-natale',
    description:
      'Cono a spirale continua dalla base al puntale: acceso in sequenza sembra una luce che gira. Occupa poco a terra, entra anche nelle piazze strette.',
    heights: '3 m · 5 m · 7 m',
    source: 'Microled 24V bianco caldo o freddo',
    effects: 'Fisso · rotazione · dissolvenza',
    power: '230V · assorbimento 0,6 kW (5 m)',
    photo: 'FOTO: albero a spirale',
    hero: 'FOTO PRINCIPALE: Albero Spirale acceso in una piazza stretta, notturna',
    installations: [
      ['Sant’Ambrogio di Valpolicella', '5 m · Natale 2025'],
      ['Pescantina', '7 m · Natale 2024'],
      ['Cavaion Veronese', '3 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'albero-nastro',
    name: 'Albero Nastro',
    type: 'alberi-di-natale',
    description:
      'Nastri luminosi che scendono dal puntale e si allargano fino a terra, ancorati a una corona perimetrale. Sotto ci si cammina: va bene dove la piazza è anche passaggio.',
    heights: '6 m · 8 m · 12 m',
    source: 'Tubo flessibile LED bianco caldo',
    effects: 'Fisso · cascata',
    power: '230V · assorbimento 1,2 kW (8 m)',
    photo: 'FOTO: albero con nastri di luce che scendono a terra',
    hero: 'FOTO PRINCIPALE: Albero Nastro con i nastri tesi, ripresa dal basso',
    installations: [
      ['Bussolengo', '12 m · Natale 2025'],
      ['Villafranca di Verona', '8 m · Natale 2024'],
      ['Negrar', '6 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'albero-cono-classico',
    name: 'Albero Cono Classico',
    type: 'alberi-di-natale',
    description:
      'Il cono di sempre, con catene verticali e sfere lungo il profilo. Lo scelgono soprattutto i comuni piccoli: mezza giornata per montarlo, altrettanto per smontarlo.',
    heights: '3 m · 4 m · 6 m',
    source: 'Catene LED bianco caldo con sfere opaline',
    effects: 'Fisso · scintillio',
    power: '230V · assorbimento 0,5 kW (4 m)',
    photo: 'FOTO: albero conico classico davanti a un municipio',
    hero: 'FOTO PRINCIPALE: Albero Cono Classico davanti al municipio, notturna',
    installations: [
      ['Fumane', '4 m · Natale 2025'],
      ['Marano di Valpolicella', '3 m · Natale 2024'],
      ['Dolcè', '6 m · Natale 2024'],
    ],
  }),
  build({
    slug: 'albero-corona',
    name: 'Albero Corona',
    type: 'alberi-di-natale',
    description:
      'Anelli sovrapposti di diametro decrescente, illuminati indipendentemente: si accendono a salire e il puntale chiude la sequenza.',
    heights: '5 m · 7 m · 9 m',
    source: 'Microled 24V bicolore (caldo + freddo)',
    effects: 'Fisso · salita · alternanza',
    power: '230V · assorbimento 1,0 kW (7 m)',
    photo: 'FOTO: albero ad anelli luminosi sovrapposti',
    hero: 'FOTO PRINCIPALE: Albero Corona con gli anelli accesi in sequenza',
    installations: [
      ['San Pietro in Cariano', '7 m · Natale 2025'],
      ['Affi', '5 m · Natale 2024'],
      ['Rivoli Veronese', '9 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'albero-monumentale',
    name: 'Albero Monumentale',
    type: 'alberi-di-natale',
    description:
      'Il formato grande, con struttura reticolare e zavorra certificata, per piazze principali e rotonde di ingresso. Progetto strutturale e collaudo inclusi.',
    heights: '12 m · 15 m · 18 m',
    source: 'Microled 24V bianco caldo, oltre 60.000 punti',
    effects: 'Fisso · cascata · scene programmate',
    power: '230V trifase · assorbimento 3,4 kW (15 m)',
    formula: 'Noleggio stagionale con montaggio e smontaggio',
    photo: 'FOTO: albero monumentale in una piazza principale',
    hero: 'FOTO PRINCIPALE: Albero Monumentale visto dalla piazza, notturna',
    installations: [
      ['Piazza del paese, Bussolengo', '15 m · Natale 2025'],
      ['Centro commerciale, Affi', '12 m · Natale 2024'],
      ['Rotonda di ingresso, Verona nord', '18 m · Natale 2024'],
    ],
  }),
  build({
    slug: 'albero-pixel',
    name: 'Albero Pixel',
    type: 'alberi-di-natale',
    description:
      'Ogni punto luce è indirizzabile: sul cono si fanno scorrere scritte, fiocchi di neve o il logo del comune. Si programma da remoto.',
    heights: '6 m · 8 m · 10 m',
    source: 'Pixel LED RGB indirizzabili',
    effects: 'Scene programmabili · testo scorrevole · video a bassa risoluzione',
    power: '230V · assorbimento 1,8 kW (8 m)',
    formula: 'Noleggio stagionale con programmazione delle scene',
    photo: 'FOTO: albero a pixel RGB con una scritta che scorre',
    hero: 'FOTO PRINCIPALE: Albero Pixel con una scena animata in corso',
    installations: [
      ['Villafranca di Verona', '10 m · Natale 2025'],
      ['Peschiera del Garda', '8 m · Natale 2024'],
      ['Bardolino', '6 m · Natale 2024'],
    ],
  }),
  build({
    slug: 'albero-del-borgo',
    name: 'Albero del Borgo',
    type: 'alberi-di-natale',
    description:
      'Versione a parete: mezzo cono da appoggiare a una facciata, per i borghi dove non c’è spazio a terra. Fissaggio su tasselli chimici o su staffe esistenti.',
    heights: '4 m · 6 m',
    source: 'Microled 24V bianco caldo',
    effects: 'Fisso · scintillio',
    power: '230V · assorbimento 0,4 kW (4 m)',
    photo: 'FOTO: mezzo albero addossato alla facciata di un borgo',
    hero: 'FOTO PRINCIPALE: Albero del Borgo su una facciata in pietra, notturna',
    installations: [
      ['Borgo di Ponton', '4 m · Natale 2025'],
      ['Volargne', '6 m · Natale 2024'],
      ['Gargagnago', '4 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'albero-valpolicella',
    name: 'Albero Valpolicella',
    type: 'alberi-di-natale',
    description:
      'Cono rivestito di tralci stilizzati e grappoli luminosi. Nato per i comuni della Valpolicella, sta bene in ogni paese di vigne.',
    heights: '5 m · 7 m',
    source: 'Microled 24V ambra e bianco caldo',
    effects: 'Fisso · scintillio · dissolvenza',
    power: '230V · assorbimento 0,8 kW (7 m)',
    photo: 'FOTO: albero con tralci e grappoli luminosi',
    hero: 'FOTO PRINCIPALE: Albero Valpolicella davanti a una cantina storica',
    installations: [
      ['Fumane', '7 m · Natale 2025'],
      ['Marano di Valpolicella', '5 m · Natale 2024'],
      ['Negrar', '7 m · Natale 2023'],
    ],
  }),

  /* --- Attraversamenti stradali ----------------------------------------- */
  build({
    slug: 'onda-di-stelle',
    name: 'Onda di Stelle',
    type: 'attraversamenti-stradali',
    description:
      'File di stelle a densità decrescente che scendono verso il centro della carreggiata. Montaggio su fune d’acciaio già in opera o su nuovi ancoraggi.',
    heights: 'Luci da 8 a 22 m',
    source: 'Microled 24V bianco caldo',
    effects: 'Fisso · cascata · scintillio',
    power: '230V · assorbimento 0,35 kW per campata',
    photo: 'FOTO: attraversamento a cascata',
    hero: 'FOTO PRINCIPALE: Onda di Stelle sopra il corso, ripresa in asse',
    installations: [
      ['Corso Cavour, Verona', '18 m · Natale 2025'],
      ['Domegliara', '12 m · Natale 2024'],
      ['Bussolengo', '22 m · Natale 2024'],
    ],
  }),
  build({
    slug: 'cascata-di-neve',
    name: 'Cascata di Neve',
    type: 'attraversamenti-stradali',
    description:
      'Tubi verticali con effetto di caduta continua, appesi in file parallele. Si nota soprattutto in movimento: va bene sulle vie percorse in auto.',
    heights: 'Luci da 10 a 20 m',
    source: 'Tubi snowfall LED bianco freddo',
    effects: 'Caduta continua · caduta alternata',
    power: '230V · assorbimento 0,5 kW per campata',
    photo: 'FOTO: attraversamento con tubi a effetto neve che cade',
    hero: 'FOTO PRINCIPALE: Cascata di Neve sopra una via trafficata, notturna',
    installations: [
      ['Via Roma, Pescantina', '16 m · Natale 2025'],
      ['Sant’Ambrogio di Valpolicella', '14 m · Natale 2024'],
      ['Affi', '20 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'tenda-di-ghiaccio',
    name: 'Tenda di Ghiaccio',
    type: 'attraversamenti-stradali',
    description:
      'Fili verticali a lunghezza variabile, con terminali a stalattite: sopra la via si forma un soffitto luminoso continuo.',
    heights: 'Luci da 8 a 18 m',
    source: 'Microled 24V bianco freddo',
    effects: 'Fisso · scintillio freddo',
    power: '230V · assorbimento 0,4 kW per campata',
    photo: 'FOTO: tenda di fili luminosi sopra una via pedonale',
    hero: 'FOTO PRINCIPALE: Tenda di Ghiaccio vista da sotto, notturna',
    installations: [
      ['Via Mazzini, Verona', '10 m · Natale 2025'],
      ['Villafranca di Verona', '18 m · Natale 2024'],
      ['Bardolino', '12 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'archi-di-natale',
    name: 'Archi di Natale',
    type: 'attraversamenti-stradali',
    description:
      'Arcate ripetute lungo la via: ogni campata è un arco a sezione piena, decorato con festoni e stelle.',
    heights: 'Luci da 8 a 16 m',
    source: 'Microled 24V bianco caldo e ambra',
    effects: 'Fisso · onda progressiva',
    power: '230V · assorbimento 0,45 kW per campata',
    photo: 'FOTO: serie di archi luminosi lungo il corso',
    hero: 'FOTO PRINCIPALE: Archi di Natale in prospettiva lungo la via',
    installations: [
      ['Corso Porta Borsari, Verona', '9 m · Natale 2025'],
      ['Bussolengo', '14 m · Natale 2024'],
      ['Peschiera del Garda', '16 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'veli-di-luce',
    name: 'Veli di Luce',
    type: 'attraversamenti-stradali',
    seasons: ['natalizie', 'eventi'],
    description:
      'Teli di microled a bassa densità, quasi trasparenti di giorno. Nati per gli allestimenti estivi, li usiamo anche a Natale.',
    heights: 'Luci da 6 a 16 m',
    source: 'Microled 24V bianco caldo su rete trasparente',
    effects: 'Fisso · respiro lento',
    power: '230V · assorbimento 0,3 kW per campata',
    photo: 'FOTO: veli luminosi trasparenti tesi sopra una via',
    hero: 'FOTO PRINCIPALE: Veli di Luce sopra una via pedonale, sera',
    installations: [
      ['Lazise', '12 m · Estate 2025'],
      ['Garda', '10 m · Estate 2025'],
      ['Domegliara', '8 m · Natale 2024'],
    ],
  }),
  build({
    slug: 'pioggia-di-comete',
    name: 'Pioggia di Comete',
    type: 'attraversamenti-stradali',
    description:
      'Comete sospese di lunghezza diversa, orientate tutte nella stessa direzione. Danno movimento anche da ferme.',
    heights: 'Luci da 10 a 20 m',
    source: 'Microled 24V bianco freddo con code ambra',
    effects: 'Fisso · scia progressiva',
    power: '230V · assorbimento 0,4 kW per campata',
    photo: 'FOTO: comete sospese sopra la carreggiata',
    hero: 'FOTO PRINCIPALE: Pioggia di Comete vista in asse alla via',
    installations: [
      ['Verona sud', '20 m · Natale 2025'],
      ['Pescantina', '14 m · Natale 2024'],
      ['Cavaion Veronese', '10 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'ghirlanda-di-corso',
    name: 'Ghirlanda di Corso',
    type: 'attraversamenti-stradali',
    description:
      'Ghirlanda continua di abete sintetico ignifugo con luce integrata, tesa da facciata a facciata. Ha volume anche di giorno: la usiamo nei centri storici.',
    heights: 'Luci da 6 a 14 m',
    source: 'Microled 24V bianco caldo su ghirlanda ignifuga',
    effects: 'Fisso',
    power: '230V · assorbimento 0,25 kW per campata',
    photo: 'FOTO: ghirlanda di abete illuminata tesa fra due facciate',
    hero: 'FOTO PRINCIPALE: Ghirlanda di Corso in un centro storico, notturna',
    installations: [
      ['Centro storico, Verona', '8 m · Natale 2025'],
      ['Sant’Ambrogio di Valpolicella', '10 m · Natale 2024'],
      ['Torri del Benaco', '6 m · Natale 2023'],
    ],
  }),

  /* --- Sospensioni ------------------------------------------------------ */
  build({
    slug: 'cielo-di-verona',
    name: 'Cielo di Verona',
    type: 'sospensioni',
    seasons: ['natalizie', 'eventi'],
    description:
      'Cielo continuo di punti luce su tutta la piazza, sostenuto da funi incrociate. Da sotto cambia la percezione dello spazio.',
    heights: 'Superfici da 200 a 1.500 m²',
    source: 'Microled 24V bianco caldo, 25 punti/m²',
    effects: 'Fisso · scintillio casuale · onda',
    power: '230V · assorbimento 1,1 kW ogni 500 m²',
    formula: 'Noleggio stagionale con progetto degli ancoraggi',
    photo: 'FOTO: sospensione a cielo di luci',
    hero: 'FOTO PRINCIPALE: Cielo di Verona sopra la piazza, ripresa verso l’alto',
    installations: [
      ['Piazza Erbe, Verona', '900 m² · Natale 2025'],
      ['Piazza del municipio, Bussolengo', '400 m² · Natale 2024'],
      ['Lazise', '650 m² · Estate 2024'],
    ],
  }),
  build({
    slug: 'tunnel-di-luce',
    name: 'Tunnel di Luce',
    type: 'sospensioni',
    seasons: ['natalizie', 'eventi'],
    description:
      'Arcate ravvicinate che formano una galleria pedonale. Lo chiedono soprattutto i centri commerciali e le fiere: la gente ci si fotografa.',
    heights: 'Lunghezze da 10 a 60 m · larghezza 3-6 m',
    source: 'Microled 24V bianco caldo e RGB',
    effects: 'Fisso · onda in avanti · scene programmate',
    power: '230V · assorbimento 0,9 kW ogni 20 m',
    formula: 'Noleggio stagionale con montaggio',
    photo: 'FOTO: tunnel di luci pedonale',
    hero: 'FOTO PRINCIPALE: Tunnel di Luce con persone che lo attraversano',
    installations: [
      ['Centro commerciale, Affi', '40 m · Natale 2025'],
      ['Fiera, Verona', '60 m · 2024'],
      ['Peschiera del Garda', '25 m · Estate 2024'],
    ],
  }),
  build({
    slug: 'volta-stellata',
    name: 'Volta Stellata',
    type: 'sospensioni',
    seasons: ['natalizie', 'eventi'],
    description:
      'Stelle di diametro vario appese a quote diverse: da sotto sembrano un cielo in profondità. Per spazi coperti e porticati.',
    heights: 'Superfici da 100 a 600 m²',
    source: 'Stelle LED bianco caldo, diametri 40-120 cm',
    effects: 'Fisso · accensione casuale',
    power: '230V · assorbimento 0,6 kW ogni 300 m²',
    photo: 'FOTO: stelle sospese a quote diverse sotto un portico',
    hero: 'FOTO PRINCIPALE: Volta Stellata vista dal basso, notturna',
    installations: [
      ['Portici di Piazza Bra, Verona', '300 m² · Natale 2025'],
      ['Villafranca di Verona', '150 m² · Natale 2024'],
      ['Bardolino', '450 m² · Estate 2024'],
    ],
  }),
  build({
    slug: 'lampadario-di-piazza',
    name: 'Lampadario di Piazza',
    type: 'sospensioni',
    description:
      'Un solo corpo sospeso al centro della piazza, a più livelli con pendenti luminosi. Fa da punto di ritrovo.',
    heights: 'Diametri 3 m · 5 m · 7 m',
    source: 'Microled 24V bianco caldo con pendenti a stalattite',
    effects: 'Fisso · pendenti a cascata',
    power: '230V · assorbimento 0,8 kW (5 m)',
    photo: 'FOTO: grande lampadario luminoso sospeso al centro della piazza',
    hero: 'FOTO PRINCIPALE: Lampadario di Piazza ripreso dal basso, notturna',
    installations: [
      ['Piazza del municipio, Negrar', '5 m · Natale 2025'],
      ['Pescantina', '3 m · Natale 2024'],
      ['San Pietro in Cariano', '7 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'nuvole-luminose',
    name: 'Nuvole Luminose',
    type: 'sospensioni',
    seasons: ['natalizie', 'eventi'],
    description:
      'Volumi morbidi in rete metallica rivestita, sospesi a quote diverse. Nate per un evento estivo, ora sono a catalogo.',
    heights: 'Nuvole da 1,5 a 4 m di larghezza',
    source: 'Microled 24V bianco caldo su rete opalina',
    effects: 'Fisso · respiro lento · temporale (lampi)',
    power: '230V · assorbimento 0,3 kW per nuvola',
    photo: 'FOTO: nuvole luminose sospese sopra una piazza, sera',
    hero: 'FOTO PRINCIPALE: Nuvole Luminose a quote diverse, notturna',
    installations: [
      ['Lazise', '4 nuvole · Estate 2025'],
      ['Garda', '6 nuvole · Estate 2024'],
      ['Domegliara', '3 nuvole · Natale 2024'],
    ],
  }),
  build({
    slug: 'cascata-sospesa',
    name: 'Cascata Sospesa',
    type: 'sospensioni',
    description:
      'Fasci verticali di fili luminosi che scendono da un anello fino a due metri da terra.',
    heights: 'Altezze di caduta 4 m · 6 m · 8 m',
    source: 'Microled 24V bianco caldo',
    effects: 'Fisso · caduta continua',
    power: '230V · assorbimento 0,7 kW (6 m)',
    photo: 'FOTO: cascata di fili luminosi che scendono da un anello',
    hero: 'FOTO PRINCIPALE: Cascata Sospesa attraversata da un passante',
    installations: [
      ['Bussolengo', '6 m · Natale 2025'],
      ['Affi', '8 m · Natale 2024'],
      ['Cavaion Veronese', '4 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'cerchi-concentrici',
    name: 'Cerchi Concentrici',
    type: 'sospensioni',
    seasons: ['natalizie', 'eventi'],
    description:
      'Anelli luminosi di diametro crescente, sospesi sullo stesso asse e accesi in sequenza.',
    heights: 'Diametri da 1 a 6 m',
    source: 'Tubo flessibile LED bianco caldo o RGB',
    effects: 'Fisso · onda che si allarga · alternanza',
    power: '230V · assorbimento 0,5 kW per gruppo',
    photo: 'FOTO: anelli luminosi concentrici sospesi',
    hero: 'FOTO PRINCIPALE: Cerchi Concentrici visti in asse dal basso',
    installations: [
      ['Verona', '6 anelli · Natale 2025'],
      ['Peschiera del Garda', '4 anelli · Estate 2025'],
      ['Bardolino', '5 anelli · Estate 2024'],
    ],
  }),

  /* --- Facciate e portali ----------------------------------------------- */
  build({
    slug: 'portale-reale',
    name: 'Portale Reale',
    type: 'facciate-e-portali',
    description:
      'Due montanti e una trave luminosa con corona centrale. Segna dove comincia l’allestimento e chiude la prospettiva della via.',
    heights: 'Luci 4 m · 6 m · 8 m · altezza 5-7 m',
    source: 'Microled 24V bianco caldo e ambra',
    effects: 'Fisso · scintillio sulla corona',
    power: '230V · assorbimento 0,8 kW',
    photo: 'FOTO: portale luminoso ingresso corso',
    hero: 'FOTO PRINCIPALE: Portale Reale all’imbocco del corso, notturna',
    installations: [
      ['Corso Sant’Anastasia, Verona', '6 m · Natale 2025'],
      ['Bussolengo', '8 m · Natale 2024'],
      ['Villafranca di Verona', '4 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'cometa',
    name: 'Cometa',
    type: 'facciate-e-portali',
    description:
      'Cometa a parete con coda lunga, montata in diagonale su facciate storiche. Fissaggio non invasivo su staffe removibili, come richiesto dalle soprintendenze.',
    heights: 'Code da 3 a 9 m',
    source: 'Microled 24V bianco freddo con nucleo ambra',
    effects: 'Fisso · scia progressiva',
    power: '230V · assorbimento 0,3 kW',
    photo: 'FOTO: cometa su facciata storica',
    hero: 'FOTO PRINCIPALE: Cometa su una facciata in pietra, notturna',
    installations: [
      ['Palazzo comunale, Verona', '9 m · Natale 2025'],
      ['Sant’Ambrogio di Valpolicella', '5 m · Natale 2024'],
      ['Fumane', '3 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'facciata-a-pioggia',
    name: 'Facciata a Pioggia',
    type: 'facciate-e-portali',
    description:
      'Fili verticali che coprono l’intera facciata seguendo il disegno delle aperture. Il progetto si fa sulla foto raddrizzata, qualunque sia la geometria.',
    heights: 'Superfici da 40 a 500 m²',
    source: 'Microled 24V bianco caldo',
    effects: 'Fisso · pioggia · scintillio',
    power: '230V · assorbimento 0,9 kW ogni 200 m²',
    photo: 'FOTO: facciata coperta da fili luminosi verticali',
    hero: 'FOTO PRINCIPALE: Facciata a Pioggia accesa, ripresa frontale',
    installations: [
      ['Municipio, Pescantina', '180 m² · Natale 2025'],
      ['Cantina storica, Negrar', '90 m² · Natale 2024'],
      ['Hotel, Bardolino', '320 m² · Natale 2023'],
    ],
  }),
  build({
    slug: 'arco-trionfale',
    name: 'Arco Trionfale',
    type: 'facciate-e-portali',
    seasons: ['natalizie', 'eventi'],
    description:
      'Arco autoportante, da mettere dove non ci sono facciate a cui ancorarsi: parcheggi, piazzali, ingressi delle manifestazioni.',
    heights: 'Luci 4 m · 6 m · altezza 4-5 m',
    source: 'Microled 24V bianco caldo',
    effects: 'Fisso · onda',
    power: '230V · assorbimento 0,6 kW',
    formula: 'Noleggio con zavorre e certificazione',
    photo: 'FOTO: arco luminoso autoportante all’ingresso di un piazzale',
    hero: 'FOTO PRINCIPALE: Arco Trionfale all’ingresso di una manifestazione',
    installations: [
      ['Fiera, Verona', '6 m · 2025'],
      ['Sagra di Domegliara', '4 m · Estate 2025'],
      ['Affi', '6 m · Natale 2024'],
    ],
  }),
  build({
    slug: 'cornice-di-luce',
    name: 'Cornice di Luce',
    type: 'facciate-e-portali',
    seasons: ['natalizie', 'eventi'],
    description:
      'Profilo luminoso lungo il contorno di una vetrina, di un balcone o di un ingresso. Per i negozi: si monta in un’ora e non ruba spazio.',
    heights: 'Perimetri da 4 a 40 m',
    source: 'Tubo flessibile LED bianco caldo',
    effects: 'Fisso · corsa lungo il perimetro',
    power: '230V · assorbimento 0,15 kW ogni 10 m',
    photo: 'FOTO: vetrina di negozio con profilo luminoso lungo il contorno',
    hero: 'FOTO PRINCIPALE: Cornice di Luce su una vetrina, sera',
    installations: [
      ['Negozi del centro, Verona', '12 vetrine · Natale 2025'],
      ['Domegliara', '6 vetrine · Natale 2024'],
      ['Lazise', '8 vetrine · Estate 2024'],
    ],
  }),
  build({
    slug: 'rosone',
    name: 'Rosone',
    type: 'facciate-e-portali',
    description:
      'Rosone a parete, con raggi e traforo interno. Nasce per le facciate delle chiese, ma sta bene su qualsiasi muro cieco.',
    heights: 'Diametri 2 m · 3 m · 4,5 m',
    source: 'Microled 24V bianco caldo su struttura in alluminio',
    effects: 'Fisso · raggi in rotazione',
    power: '230V · assorbimento 0,4 kW (3 m)',
    photo: 'FOTO: rosone luminoso su una facciata cieca',
    hero: 'FOTO PRINCIPALE: Rosone acceso su una facciata di chiesa, notturna',
    installations: [
      ['Parrocchia di Domegliara', '3 m · Natale 2025'],
      ['Gargagnago', '2 m · Natale 2024'],
      ['Volargne', '4,5 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'portale-abete',
    name: 'Portale Abete',
    type: 'facciate-e-portali',
    description:
      'Portale rivestito di abete sintetico ignifugo con luce integrata e decori rossi. Sta bene all’ingresso dei mercatini.',
    heights: 'Luci 2,5 m · 4 m · altezza 3-4 m',
    source: 'Microled 24V bianco caldo su ghirlanda ignifuga',
    effects: 'Fisso',
    power: '230V · assorbimento 0,3 kW',
    photo: 'FOTO: portale di abete illuminato all’ingresso di un mercatino',
    hero: 'FOTO PRINCIPALE: Portale Abete all’ingresso del mercatino di Natale',
    installations: [
      ['Mercatino di Natale, Verona', '4 m · Natale 2025'],
      ['Bussolengo', '2,5 m · Natale 2024'],
      ['Peschiera del Garda', '4 m · Natale 2023'],
    ],
  }),

  /* --- Soggetti 3D ------------------------------------------------------ */
  build({
    slug: 'renna-aurora',
    name: 'Renna Aurora',
    type: 'soggetti-3d',
    description:
      'Renna in filo di alluminio saldato, con testa orientabile e palco separato. Si mette a terra, su un tetto o su una rotonda.',
    heights: '1,2 m · 1,8 m · 2,4 m',
    source: 'Microled 24V bianco caldo su filo di alluminio',
    effects: 'Fisso · scintillio · testa animata',
    power: '230V · assorbimento 0,2 kW (1,8 m)',
    photo: 'FOTO: renna 3D luminosa',
    hero: 'FOTO PRINCIPALE: Renna Aurora su una rotonda innevata, notturna',
    installations: [
      ['Rotonda SP11, Domegliara', '2,4 m · Natale 2025'],
      ['Piazza, Pescantina', '1,8 m · Natale 2024'],
      ['Centro commerciale, Affi', '1,2 m · Natale 2024'],
    ],
  }),
  build({
    slug: 'sfera-polare',
    name: 'Sfera Polare',
    type: 'soggetti-3d',
    seasons: ['natalizie', 'eventi'],
    description:
      'Sfera geodetica in alluminio con maglia luminosa: nelle misure grandi ci si cammina dentro. Regge bene sulle rotonde.',
    heights: 'Diametri 1 m · 2 m · 3 m · 4 m',
    source: 'Microled 24V bianco freddo o RGB',
    effects: 'Fisso · rotazione apparente · cambio colore',
    power: '230V · assorbimento 0,5 kW (3 m)',
    photo: 'FOTO: sfera luminosa 3D su rotonda',
    hero: 'FOTO PRINCIPALE: Sfera Polare al centro di una rotonda, notturna',
    installations: [
      ['Rotonda, Verona nord', '4 m · Natale 2025'],
      ['Bussolengo', '2 m · Natale 2024'],
      ['Lazise', '3 m · Estate 2024'],
    ],
  }),
  build({
    slug: 'slitta-di-babbo-natale',
    name: 'Slitta di Babbo Natale',
    type: 'soggetti-3d',
    description:
      'Slitta a grandezza reale, con o senza renne al traino. La seduta è rinforzata: ci si può salire per le foto.',
    heights: 'Lunghezze 2 m · 3 m · 4,5 m con renne',
    source: 'Microled 24V bianco caldo e rosso',
    effects: 'Fisso · scintillio',
    power: '230V · assorbimento 0,35 kW (3 m)',
    photo: 'FOTO: slitta luminosa 3D con posto per le foto',
    hero: 'FOTO PRINCIPALE: Slitta di Babbo Natale con una famiglia che si fotografa',
    installations: [
      ['Piazza, Villafranca di Verona', '4,5 m · Natale 2025'],
      ['Centro commerciale, Affi', '3 m · Natale 2024'],
      ['Domegliara', '2 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'pacchi-luminosi',
    name: 'Pacchi Luminosi',
    type: 'soggetti-3d',
    description:
      'Set di tre pacchi regalo di misura diversa, con fiocco luminoso. Alla base degli alberi o da soli, negli angoli.',
    heights: 'Lati 40 · 60 · 90 cm',
    source: 'Microled 24V bianco caldo con nastri rossi',
    effects: 'Fisso · accensione alternata',
    power: '230V · assorbimento 0,1 kW per set',
    photo: 'FOTO: base decorata con pacchi luminosi',
    hero: 'FOTO PRINCIPALE: Pacchi Luminosi alla base di un albero, notturna',
    installations: [
      ['Piazza Bra, Verona', '3 set · Natale 2025'],
      ['Bussolengo', '2 set · Natale 2024'],
      ['Negrar', '1 set · Natale 2023'],
    ],
  }),
  build({
    slug: 'stella-puntale',
    name: 'Stella Puntale',
    type: 'soggetti-3d',
    description:
      'Stella a cinque o otto punte, in cima agli alberi o da sola su un palo. Struttura in alluminio, leggera anche nelle misure grandi.',
    heights: 'Diametri 60 cm · 1 m · 1,6 m · 2,2 m',
    source: 'Microled 24V bianco caldo con bordo ambra',
    effects: 'Fisso · scintillio · pulsazione',
    power: '230V · assorbimento 0,15 kW (1,6 m)',
    photo: 'FOTO: puntale a stella acceso in cima a un albero',
    hero: 'FOTO PRINCIPALE: Stella Puntale in cima all’albero, controluce notturno',
    installations: [
      ['Piazza Bra, Verona', '2,2 m · Natale 2025'],
      ['Domegliara', '1 m · Natale 2024'],
      ['Fumane', '1,6 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'pupazzo-di-neve',
    name: 'Pupazzo di Neve',
    type: 'soggetti-3d',
    description:
      'Pupazzo con sciarpa e cappello, in tre misure. Piace ai bambini: va messo dove c’è passaggio a piedi.',
    heights: '1,2 m · 1,8 m · 2,5 m',
    source: 'Microled 24V bianco freddo con dettagli colorati',
    effects: 'Fisso · scintillio',
    power: '230V · assorbimento 0,2 kW (1,8 m)',
    photo: 'FOTO: pupazzo di neve luminoso 3D in una via pedonale',
    hero: 'FOTO PRINCIPALE: Pupazzo di Neve in una via pedonale, notturna',
    installations: [
      ['Via Mazzini, Verona', '2,5 m · Natale 2025'],
      ['Pescantina', '1,8 m · Natale 2024'],
      ['Cavaion Veronese', '1,2 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'campane',
    name: 'Campane',
    type: 'soggetti-3d',
    description:
      'Coppia di campane 3D con nastro, da appendere o da appoggiare. Nella versione sospesa oscillano leggermente con il vento.',
    heights: 'Altezze 60 cm · 1 m · 1,5 m',
    source: 'Microled 24V ambra e bianco caldo',
    effects: 'Fisso · dondolio luminoso',
    power: '230V · assorbimento 0,12 kW per coppia',
    photo: 'FOTO: coppia di campane luminose sospese',
    hero: 'FOTO PRINCIPALE: Campane sospese sopra un ingresso, notturna',
    installations: [
      ['Parrocchia, Domegliara', '1,5 m · Natale 2025'],
      ['Gargagnago', '1 m · Natale 2024'],
      ['Volargne', '60 cm · Natale 2023'],
    ],
  }),

  /* --- Zucche di Halloween (eventi) ------------------------------------- */
  build({
    slug: 'zucca-lanterna',
    name: 'Zucca Lanterna',
    type: 'zucche-di-halloween',
    seasons: ['eventi'],
    description:
      'Zucca 3D con il volto traforato e la luce che esce dagli occhi. Struttura in alluminio verniciato arancio: resta arancione anche da spenta.',
    heights: 'Diametri 60 cm · 1 m · 1,5 m',
    source: 'Microled 24V ambra con nucleo caldo',
    effects: 'Fisso · fiamma · lampeggio lento',
    power: '230V · assorbimento 0,15 kW (1 m)',
    photo: 'FOTO: zucca luminosa 3D per Halloween',
    hero: 'FOTO PRINCIPALE: Zucca Lanterna accesa davanti a un negozio, sera',
    installations: [
      ['Centro commerciale, Affi', '1,5 m · Halloween 2025'],
      ['Domegliara', '1 m · Halloween 2024'],
      ['Bussolengo', '60 cm · Halloween 2024'],
    ],
  }),
  build({
    slug: 'zucca-sorridente',
    name: 'Zucca Sorridente',
    type: 'zucche-di-halloween',
    seasons: ['eventi'],
    description:
      'La variante amichevole, senza denti aguzzi: nata per gli asili e le feste di paese dove i mostri fanno troppa paura.',
    heights: 'Diametri 50 cm · 80 cm · 1,2 m',
    source: 'Microled 24V ambra',
    effects: 'Fisso · pulsazione',
    power: '230V · assorbimento 0,1 kW (80 cm)',
    photo: 'FOTO: zucca luminosa dal volto sorridente, festa di paese',
    hero: 'FOTO PRINCIPALE: Zucca Sorridente in mezzo ai bambini, sera',
    installations: [
      ['Festa di paese, Pescantina', '1,2 m · Halloween 2025'],
      ['Cavaion Veronese', '80 cm · Halloween 2024'],
      ['Negrar', '50 cm · Halloween 2023'],
    ],
  }),
  build({
    slug: 'pipistrelli-in-volo',
    name: 'Pipistrelli in Volo',
    type: 'zucche-di-halloween',
    seasons: ['eventi'],
    description:
      'Sagome 2D in sequenza, montate a quote crescenti per suggerire il volo. Si appendono a una fune o direttamente in facciata.',
    heights: 'Aperture alari 40 · 70 · 100 cm',
    source: 'Microled 24V viola e bianco freddo',
    effects: 'Fisso · accensione in sequenza',
    power: '230V · assorbimento 0,1 kW per gruppo di 5',
    photo: 'FOTO: sagome di pipistrelli luminosi in sequenza su una facciata',
    hero: 'FOTO PRINCIPALE: Pipistrelli in Volo su una facciata, notturna',
    installations: [
      ['Verona', '12 sagome · Halloween 2025'],
      ['Domegliara', '8 sagome · Halloween 2024'],
      ['Affi', '15 sagome · Halloween 2024'],
    ],
  }),
  build({
    slug: 'gatto-nero',
    name: 'Gatto Nero',
    type: 'zucche-di-halloween',
    seasons: ['eventi'],
    description:
      'Sagoma 3D con la schiena inarcata e la coda alta, in due misure. Verniciata nera opaca: di giorno resta una silhouette pulita.',
    heights: '80 cm · 1,3 m',
    source: 'Microled 24V verde e ambra',
    effects: 'Fisso · occhi lampeggianti',
    power: '230V · assorbimento 0,08 kW',
    photo: 'FOTO: sagoma 3D di gatto nero luminoso',
    hero: 'FOTO PRINCIPALE: Gatto Nero acceso su un muretto, sera',
    installations: [
      ['Bussolengo', '1,3 m · Halloween 2025'],
      ['Pescantina', '80 cm · Halloween 2024'],
      ['Sant’Ambrogio di Valpolicella', '1,3 m · Halloween 2023'],
    ],
  }),

  /* --- Scritte luminose (eventi) ---------------------------------------- */
  build({
    slug: 'scritta-buone-feste',
    name: 'Scritta “Buone Feste”',
    type: 'scritte-luminose',
    seasons: ['natalizie', 'eventi'],
    description:
      'Scritta corsiva luminosa da tendere fra due facciate o da appoggiare a terra. Il carattere è disegnato da noi: le lettere si leggono anche da lontano.',
    heights: 'Lunghezze 3 m · 5 m · 8 m',
    source: 'Tubo flessibile LED bianco caldo',
    effects: 'Fisso · scrittura progressiva',
    power: '230V · assorbimento 0,3 kW (5 m)',
    photo: 'FOTO: scritta luminosa “Buone Feste” tesa sopra la via',
    hero: 'FOTO PRINCIPALE: Scritta “Buone Feste” accesa sopra il corso',
    installations: [
      ['Corso, Bussolengo', '8 m · Natale 2025'],
      ['Domegliara', '5 m · Natale 2024'],
      ['Fumane', '3 m · Natale 2023'],
    ],
  }),
  build({
    slug: 'scritta-su-misura',
    name: 'Scritta su misura',
    type: 'scritte-luminose',
    seasons: ['eventi'],
    description:
      'Il nome del paese, di un evento o di un’azienda, nel carattere che ci mandi. Dal file vettoriale alla struttura in una decina di giorni.',
    heights: 'Lettere da 30 cm a 2 m',
    source: 'Tubo flessibile LED o microled, colore a scelta',
    effects: 'Fisso · scrittura progressiva · lampeggio',
    power: '230V · assorbimento secondo lo sviluppo',
    formula: 'Produzione su disegno · vendita o noleggio',
    photo: 'FOTO: scritta luminosa su misura con il nome di un evento',
    hero: 'FOTO PRINCIPALE: Scritta su misura accesa all’ingresso di un evento',
    installations: [
      ['Fiera, Verona', 'lettere 1,2 m · 2025'],
      ['Sagra, Domegliara', 'lettere 60 cm · Estate 2025'],
      ['Cantina, Negrar', 'lettere 40 cm · 2024'],
    ],
  }),
  build({
    slug: 'numeri-anniversario',
    name: 'Numeri Anniversario',
    type: 'scritte-luminose',
    seasons: ['eventi'],
    description:
      'Cifre luminose alte fino a due metri, autoportanti. Per gli anniversari dei comuni e le feste aziendali.',
    heights: 'Cifre 1 m · 1,5 m · 2 m',
    source: 'Microled 24V bianco caldo o RGB',
    effects: 'Fisso · cambio colore',
    power: '230V · assorbimento 0,2 kW per cifra',
    formula: 'Noleggio con basi zavorrate',
    photo: 'FOTO: cifre luminose autoportanti per un anniversario',
    hero: 'FOTO PRINCIPALE: Numeri Anniversario accesi durante una festa, sera',
    installations: [
      ['Anniversario del comune, Pescantina', 'cifre 2 m · 2025'],
      ['Festa aziendale, Affi', 'cifre 1,5 m · 2024'],
      ['Verona', 'cifre 1 m · 2024'],
    ],
  }),

  /* --- Allestimenti per eventi ------------------------------------------ */
  build({
    slug: 'arco-nuziale',
    name: 'Arco Nuziale',
    type: 'allestimenti-evento',
    seasons: ['eventi'],
    description:
      'Arco leggero per cerimonie all’aperto, con luce calda bassa: la struttura si può intrecciare con i fiori. Si monta in un’ora.',
    heights: 'Luce 2,5 m · altezza 3 m',
    source: 'Microled 24V bianco caldo dimmerabile',
    effects: 'Fisso · dimmerazione continua',
    power: '230V o batteria · assorbimento 0,1 kW',
    formula: 'Noleggio a giornata',
    photo: 'FOTO: arco luminoso per una cerimonia all’aperto, tramonto',
    hero: 'FOTO PRINCIPALE: Arco Nuziale acceso durante una cerimonia, tramonto',
    installations: [
      ['Villa, San Pietro in Cariano', '2025'],
      ['Agriturismo, Fumane', '2024'],
      ['Cantina, Negrar', '2024'],
    ],
  }),
  build({
    slug: 'quinte-per-palco',
    name: 'Quinte per Palco',
    type: 'allestimenti-evento',
    seasons: ['eventi'],
    description:
      'Pannelli luminosi verticali da mettere ai lati del palco: chiudono la scena e danno profondità alle riprese. Compatibili con i truss standard.',
    heights: 'Altezze 3 m · 4 m · 5 m',
    source: 'Microled 24V RGB su rete tecnica',
    effects: 'Scene programmate · sincronia audio',
    power: '230V · assorbimento 0,6 kW per coppia',
    formula: 'Noleggio con tecnico',
    photo: 'FOTO: quinte luminose ai lati di un palco durante un concerto',
    hero: 'FOTO PRINCIPALE: Quinte per Palco accese durante un concerto, sera',
    installations: [
      ['Sagra, Domegliara', 'quinte 4 m · Estate 2025'],
      ['Piazza, Bussolengo', 'quinte 5 m · Estate 2024'],
      ['Arena estiva, Lazise', 'quinte 3 m · Estate 2024'],
    ],
  }),
  build({
    slug: 'cuori-luminosi',
    name: 'Cuori Luminosi',
    type: 'allestimenti-evento',
    seasons: ['eventi'],
    description:
      'Cuori 2D e 3D di misura diversa, da appendere o da appoggiare. Nati per San Valentino, li noleggiano soprattutto i comuni sul lago.',
    heights: 'Diametri 50 cm · 1 m · 2 m',
    source: 'Microled 24V rosso e bianco caldo',
    effects: 'Fisso · battito',
    power: '230V · assorbimento 0,12 kW (1 m)',
    formula: 'Noleggio stagionale',
    photo: 'FOTO: cuori luminosi sospesi sul lungolago',
    hero: 'FOTO PRINCIPALE: Cuori Luminosi sul lungolago, sera',
    installations: [
      ['Lungolago, Bardolino', '2 m · San Valentino 2026'],
      ['Lazise', '1 m · San Valentino 2025'],
      ['Garda', '50 cm · San Valentino 2024'],
    ],
  }),
  build({
    slug: 'bandierine-di-luce',
    name: 'Bandierine di Luce',
    type: 'allestimenti-evento',
    seasons: ['eventi'],
    description:
      'Festoni di bandierine luminose per sagre e feste di quartiere: leggeri, veloci da tendere e resistenti alla pioggia estiva.',
    heights: 'Campate da 8 a 30 m',
    source: 'Festoni LED bianco caldo, IP65',
    effects: 'Fisso · onda',
    power: '230V · assorbimento 0,2 kW ogni 20 m',
    formula: 'Noleggio a manifestazione',
    photo: 'FOTO: festoni di bandierine luminose sopra una sagra di paese',
    hero: 'FOTO PRINCIPALE: Bandierine di Luce sopra i tavoli di una sagra, sera',
    installations: [
      ['Sagra, Domegliara', '30 m · Estate 2025'],
      ['Festa di quartiere, Verona', '20 m · Estate 2025'],
      ['Pescantina', '12 m · Estate 2024'],
    ],
  }),
];

export function getSubject(slug: string): Subject | undefined {
  return subjects.find((subject) => subject.slug === slug);
}

export function subjectsBySeason(season: Season): Subject[] {
  return subjects.filter((subject) => subject.seasons.includes(season));
}

/** Fino a `limit` soggetti della stessa tipologia, escluso quello corrente. */
export function relatedSubjects(subject: Subject, limit = 4): Subject[] {
  const sameType = subjects.filter((item) => item.type === subject.type && item.slug !== subject.slug);
  if (sameType.length >= limit) return sameType.slice(0, limit);
  const fillers = subjects.filter(
    (item) => item.type !== subject.type && item.seasons.some((s) => subject.seasons.includes(s)),
  );
  return [...sameType, ...fillers].slice(0, limit);
}
