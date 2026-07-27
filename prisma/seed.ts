/**
 * Dati iniziali delle news.
 *
 * Riproduce l'archivio disegnato nel mockup 2i, 14 articoli di cui 2 bozze,
 * con i titoli, le categorie e le date che compaiono nei mockup 2d e 2i.
 * L'articolo di Piazza Bra ha il corpo completo del mockup 2e, così la pagina
 * di lettura si vede subito con contenuti veri.
 *
 * CONTENUTI SEGNAPOSTO: vanno sostituiti dai testi reali della redazione.
 *
 *   npm run db:seed      aggiunge quello che manca
 *   npm run db:reset     azzera il database e riparte da qui
 */
import { PrismaClient } from '@prisma/client';
import { serializeBody, type BodyBlock } from '../src/lib/articles/body';
import { articleCover } from '../src/data/photos';

const prisma = new PrismaClient();

type Seed = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverAlt: string;
  tags: string[];
  status: 'draft' | 'published';
  featured?: boolean;
  publishedAt: string | null;
  seoTitle?: string;
  seoDescription?: string;
  body: BodyBlock[];
};

/** Paragrafi di riempimento coerenti col mestiere, per gli articoli minori. */
function shortBody(lead: string, paragraphs: string[]): BodyBlock[] {
  return [
    { type: 'lead', text: lead },
    ...paragraphs.map((text) => ({ type: 'paragraph' as const, text })),
  ];
}

const articles: Seed[] = [
  {
    slug: 'natale-verona-piazza-bra',
    title: 'Il Natale di Verona si accende: le nuove luminarie di Piazza Bra',
    excerpt:
      'Tre settimane di lavoro, 42 sospensioni e un albero da otto metri: il racconto dell’allestimento firmato IME Service per il centro storico.',
    category: 'natale-in-citta',
    coverAlt:
      'Grandi angeli luminosi sospesi sopra una via cittadina, con le facciate illuminate ai lati',
    tags: ['Verona', 'Luminarie natalizie', 'Enti pubblici'],
    status: 'published',
    featured: true,
    publishedAt: '2025-12-12',
    // Il nome dell'azienda lo aggiunge il template dei titoli: qui non va ripetuto.
    seoTitle: 'Le nuove luminarie di Piazza Bra a Verona',
    seoDescription:
      'Tre settimane di lavoro, 42 sospensioni e un albero da otto metri: come abbiamo allestito il Natale del centro storico di Verona.',
    body: [
      {
        type: 'paragraph',
        text: 'Il primo sopralluogo è di settembre, quando in piazza c’è ancora il sole. Si misurano gli interassi tra i pali, si verificano i punti di alimentazione, si fotografa ogni facciata: da qui nasce la proposta grafica che il Comune approva a fine ottobre.',
      },
      {
        type: 'paragraph',
        text: 'Il montaggio comincia il 18 novembre e procede di notte, per non interferire con il passaggio. Le sospensioni vengono tese tra i punti di ancoraggio già predisposti, mentre l’albero centrale viene assemblato in loco in due giornate.',
      },
      {
        type: 'quote',
        text: 'Una piazza illuminata bene non si nota: si sente. È quello il risultato che cerchiamo.',
        attribution: 'La squadra IME Service',
      },
      {
        type: 'image',
        label: 'FOTO: montaggio notturno con cestello elevatore',
        caption: 'Il montaggio delle sospensioni, novembre 2025.',
      },
      {
        type: 'paragraph',
        text: 'L’accensione ufficiale è il 5 dicembre. Tutti gli effetti sono programmati su timer astronomico, con una scena ridotta dopo mezzanotte per contenere i consumi: l’intero allestimento assorbe meno di un vecchio impianto a incandescenza di un terzo delle dimensioni.',
      },
    ],
  },
  {
    slug: 'zucche-luminose-collezione-halloween',
    title: 'Zucche luminose: la collezione Halloween è in produzione',
    excerpt: 'Sei nuovi soggetti 3D, dalle zucche ai pipistrelli, già disponibili a noleggio.',
    category: 'collezioni',
    coverAlt: 'Zucche intagliate e illuminate dall’interno, disposte su balle di paglia al calare della sera',
    tags: ['Halloween', 'Soggetti 3D', 'Noleggio'],
    status: 'published',
    publishedAt: '2025-10-28',
    body: shortBody(
      'In officina è già autunno da luglio: la collezione di Halloween si costruisce mentre fuori c’è ancora il caldo.',
      [
        'Sei soggetti nuovi, tutti in filo di alluminio saldato e microled: due zucche di misura diversa, un gruppo di pipistrelli da facciata, un gatto nero e due sagome da appoggiare a terra. La verniciatura è opaca, così anche di giorno le strutture restano pulite da guardare.',
        'Come per le luminarie natalizie, i soggetti si possono acquistare o noleggiare per la stagione: nel secondo caso il montaggio, lo smontaggio e la revisione annuale sono a carico nostro.',
      ],
    ),
  },
  {
    slug: 'impianto-luci-studio-televisivo-telearena',
    title: 'Nuovo impianto luci per lo studio televisivo di TeleArena',
    excerpt:
      'Dimmerazione DALI e corpi LED a temperatura variabile per le riprese in diretta.',
    category: 'progetti',
    coverAlt: 'Facciata di un edificio storico illuminata dal basso con luce calda, di notte',
    tags: ['Impianti', 'Illuminazione tecnica'],
    status: 'published',
    publishedAt: '2025-09-09',
    body: shortBody(
      'Uno studio televisivo chiede due cose insieme: luce che non stanchi gli occhi e luce che la telecamera legga bene.',
      [
        'L’impianto è stato rifatto con corpi LED a temperatura di colore variabile, così la stessa scena può passare dal bianco freddo del telegiornale al bianco caldo dei programmi serali senza cambiare i corpi illuminanti.',
        'Il controllo è su bus DALI, con scene richiamabili da una consolle in regia. Ogni gruppo è dimmerabile in modo continuo: niente sfarfallii sulle riprese, nemmeno rallentate.',
      ],
    ),
  },
  {
    slug: 'impianti-noleggio-estate-sagre-venete',
    title: 'Impianti a noleggio: l’estate delle sagre venete',
    excerpt: 'Quadri, cablaggi e illuminazione per 14 manifestazioni tra Verona e Trento.',
    category: 'progetti',
    coverAlt: 'Festa all’aperto di sera: bandierine colorate e lampadine sospese sopra la gente',
    tags: ['Noleggio', 'Eventi', 'Sicurezza'],
    status: 'published',
    publishedAt: '2025-07-22',
    body: shortBody(
      'Da giugno a settembre il magazzino si svuota: quadri, linee, torri faro e festoni partono per le sagre di mezza provincia.',
      [
        'Ogni manifestazione ha un progetto suo, per quanto piccola: si contano i carichi, si dimensionano le linee, si predispongono i quadri con le protezioni giuste e si lascia uno schema in cabina, per chi arriva dopo.',
        'Durante gli eventi restiamo reperibili: un guasto alle nove di sera, con tremila persone in piazza, non è un problema che si può rimandare al giorno dopo.',
      ],
    ),
  },
  {
    slug: 'come-nasce-un-soggetto-su-misura',
    title: 'Come nasce un soggetto su misura',
    excerpt: 'Dal disegno a mano al collaudo: un giro nel nostro reparto produzione.',
    category: 'la-fabbrica',
    coverAlt: 'Saldatura di un telaio metallico in officina, con le scintille attorno alla torcia',
    tags: ['La Fabbrica', 'Produzione', 'Soggetti su misura'],
    status: 'published',
    publishedAt: '2025-05-14',
    body: shortBody(
      'Quasi sempre comincia con una foto storta di un disegno fatto a mano. Va benissimo così.',
      [
        'Dal disegno si ricava un vettoriale pulito, poi si decide la struttura: filo di alluminio piegato per i soggetti 2D, telaio saldato per i 3D che devono stare in piedi da soli. In questa fase si sceglie anche quanti punti luce servono per centimetro, che è la differenza tra un soggetto che si legge e uno che sembra spento.',
        'Il cablaggio è la parte più lunga. Ogni tratta viene provata a banco prima di chiudere la struttura, e ogni soggetto esce dall’officina con la sua prova di funzionamento e la documentazione elettrica.',
      ],
    ),
  },
  {
    slug: 'cerchiamo-elettricisti-la-squadra-si-allarga',
    title: 'Cerchiamo elettricisti: la squadra si allarga',
    excerpt: 'Due posizioni aperte per la stagione delle installazioni.',
    category: 'azienda',
    coverAlt: 'Due operai in giacca ad alta visibilità al lavoro sul cestello di una piattaforma aerea',
    tags: ['Lavora con noi', 'Azienda'],
    status: 'published',
    publishedAt: '2025-02-18',
    body: shortBody(
      'Le commesse crescono e le squadre devono crescere con loro: cerchiamo un elettricista installatore e un aiuto officina.',
      [
        'Non serve arrivare già formati sulle luminarie: quello lo si impara qui, con l’affiancamento. Serve invece voglia di lavorare in squadra, precisione sui cantieri e rispetto delle procedure di sicurezza, soprattutto per i lavori in quota.',
        'Chi entra viene formato su sicurezza, piattaforme aeree e certificazioni, e dopo il periodo di prova passa a tempo indeterminato.',
      ],
    ),
  },
  {
    slug: 'accensione-natale-bussolengo',
    title: 'Bussolengo accende il centro: 1.400 metri di luce',
    excerpt:
      'Attraversamenti, portali e un albero da dodici metri per il Natale del centro commerciale naturale.',
    category: 'natale-in-citta',
    coverAlt: 'Piazza di paese di notte con l’albero di Natale acceso e fili di luci tesi sopra la pavimentazione bagnata',
    tags: ['Bussolengo', 'Luminarie natalizie'],
    status: 'published',
    publishedAt: '2025-12-01',
    body: shortBody(
      'Millequattrocento metri di vie da illuminare, e un solo fine settimana per montarli senza chiudere i negozi.',
      [
        'L’allestimento tiene insieme tre soggetti diversi: gli attraversamenti sulle vie principali, i portali ai due ingressi del centro e l’albero monumentale in piazza. Tutto alimentato dai punti già esistenti, con l’aggiunta di due sole nuove derivazioni.',
        'La programmazione prevede l’accensione al tramonto e una scena ridotta dall’una di notte, come richiesto dal regolamento comunale sul risparmio energetico.',
      ],
    ),
  },
  {
    slug: 'luminarie-a-basso-consumo',
    title: 'Quanto consuma davvero una luminaria',
    excerpt:
      'Numeri alla mano: un attraversamento a microled costa meno di una lampadina da comodino accesa tutta la sera.',
    category: 'collezioni',
    coverAlt: 'Viale alberato di notte, con gli alberi spogli avvolti da fili di luci e la neve sulla strada',
    tags: ['Consumi', 'LED', 'Enti pubblici'],
    status: 'published',
    publishedAt: '2025-11-05',
    body: shortBody(
      'È la domanda che ci fa ogni sindaco al primo incontro, ed è giusto che la faccia.',
      [
        'Un attraversamento stradale di quindici metri a microled assorbe intorno ai 350 watt. Acceso sei ore al giorno per quaranta giorni sono circa 84 kWh: meno di quello che consuma un frigorifero in tre mesi.',
        'Il grosso del costo di un allestimento non è l’energia: sono il montaggio, i mezzi e la manutenzione. Per questo conviene ragionare su più stagioni invece che su un anno solo.',
      ],
    ),
  },
  {
    slug: 'nuovo-magazzino-domegliara',
    title: 'Il nuovo magazzino: 600 metri quadri per le luminarie a noleggio',
    excerpt:
      'Scaffalature dedicate, revisione annuale e tracciabilità di ogni soggetto che esce e rientra.',
    category: 'azienda',
    coverAlt: 'Corsia di magazzino con scaffalature metalliche cariche di scatole e segnaletica gialla a terra',
    tags: ['Azienda', 'Magazzino', 'Noleggio'],
    status: 'published',
    publishedAt: '2025-08-19',
    body: shortBody(
      'Il parco luminarie a noleggio è cresciuto al punto da meritarsi un capannone tutto suo.',
      [
        'Ogni soggetto ha la sua posizione a scaffale e la sua scheda: quando esce si registra dove va, quando rientra passa dalla revisione elettrica prima di tornare al suo posto.',
        'È un lavoro noioso che paga a dicembre, quando bisogna caricare venti mezzi in tre giorni e nessuno può permettersi di cercare un pezzo.',
      ],
    ),
  },
  {
    slug: 'illuminazione-facciata-cantina-valpolicella',
    title: 'Una cantina della Valpolicella illuminata come si deve',
    excerpt: 'Luce radente sulla pietra, niente abbagliamento per chi arriva dalla strada.',
    category: 'progetti',
    coverAlt: 'Facciata di un edificio storico illuminata dal basso con luce calda, di notte',
    tags: ['Illuminazione architetturale', 'Valpolicella'],
    status: 'published',
    publishedAt: '2025-06-11',
    body: shortBody(
      'Illuminare un edificio storico significa soprattutto decidere cosa lasciare al buio.',
      [
        'Sulla facciata principale abbiamo usato una luce radente a 2700 K, montata a terra e schermata verso l’alto: la pietra prende profondità e nessun corpo illuminante finisce nel campo visivo di chi arriva.',
        'L’impianto è dimmerabile: nelle sere di apertura al pubblico sale, nelle altre resta al trenta per cento. Anche questo è un modo di rispettare il paesaggio notturno.',
      ],
    ),
  },
  {
    slug: 'sicurezza-lavori-in-quota',
    title: 'Lavori in quota: come ci prepariamo prima di salire',
    excerpt:
      'Formazione, piattaforme certificate e un piano di montaggio scritto per ogni cantiere.',
    category: 'azienda',
    coverAlt: 'Due operai in giacca ad alta visibilità al lavoro sul cestello di una piattaforma aerea',
    tags: ['Sicurezza', 'Formazione'],
    status: 'published',
    publishedAt: '2025-04-02',
    body: shortBody(
      'Le luminarie si montano a otto metri da terra, spesso di notte e quasi sempre d’inverno. Non è un lavoro da improvvisare.',
      [
        'Ogni installazione ha un piano scritto: chi sale, con quale mezzo, con quali ancoraggi e con quale procedura di emergenza. Le piattaforme sono revisionate ogni anno e gli operatori hanno il patentino.',
        'La regola che non si discute è una sola: se il vento supera la soglia, si scende e si rimanda. Un giorno di ritardo si recupera, il resto no.',
      ],
    ),
  },
  {
    slug: 'progetto-luci-mercatino-natale',
    title: 'Il mercatino di Natale, casetta per casetta',
    excerpt: 'Linee dedicate, quadri protetti e ghirlande su ogni ingresso: l’allestimento di dicembre.',
    category: 'natale-in-citta',
    coverAlt: 'Piazza di paese di notte con l’albero di Natale acceso e fili di luci tesi sopra la pavimentazione bagnata',
    tags: ['Mercatini', 'Impianti temporanei'],
    status: 'published',
    publishedAt: '2025-11-24',
    body: shortBody(
      'Quaranta casette, ognuna con la sua presa, la sua stufa e le sue luci: il mercatino è un piccolo quartiere da alimentare.',
      [
        'Le linee vengono dimensionate sui carichi dichiarati dagli espositori, con un margine per le stufe che arrivano sempre all’ultimo. I quadri sono in posizione protetta e accessibile, con differenziali dedicati per gruppi di casette.',
        'Sopra, la parte scenografica: ghirlande sugli ingressi, tende di luce fra le file e un portale all’imbocco. È la parte che si fotografa, ma è quella che si monta per ultima.',
      ],
    ),
  },
  {
    slug: 'natale-2026-si-progetta-in-primavera',
    title: 'Natale 2026: si progetta già in primavera',
    excerpt: 'Perché conviene definire l’allestimento con otto mesi di anticipo.',
    category: 'natale-in-citta',
    coverAlt: 'Via pedonale con festoni di luci tesi da un lato all’altro e un pannello luminoso con casetta e abeti',
    tags: ['Progettazione', 'Enti pubblici'],
    status: 'draft',
    publishedAt: null,
    body: shortBody(
      'Chi chiama a settembre trova quello che è rimasto. Chi chiama ad aprile sceglie.',
      [
        'La produzione dei soggetti su misura richiede quattro-sei settimane, a cui vanno aggiunti i tempi di approvazione delle proposte grafiche e, per i comuni, quelli delle procedure di acquisto.',
        'Lavorare in primavera vuol dire anche poter fare il sopralluogo con calma, verificare gli ancoraggi esistenti e programmare eventuali interventi sull’impianto elettrico fuori dalla stagione.',
      ],
    ),
  },
  {
    slug: 'nuovo-catalogo-soggetti',
    title: 'Il nuovo catalogo soggetti è in preparazione',
    excerpt:
      'Schede tecniche complete, misure disponibili e formule di noleggio per ogni soggetto a catalogo.',
    category: 'collezioni',
    coverAlt: 'Grande albero di Natale acceso in piazza, con la stella in cima e una casetta di legno accanto',
    tags: ['Catalogo', 'La Fabbrica'],
    status: 'draft',
    publishedAt: null,
    body: shortBody(
      'Stiamo mettendo insieme le schede di tutti i soggetti che produciamo, con le misure e i consumi reali.',
      [
        'Per ogni soggetto ci saranno le altezze disponibili, il tipo di sorgente luminosa, gli effetti di accensione, l’assorbimento e la formula: vendita o noleggio stagionale.',
        'Nel frattempo il catalogo online è già consultabile e filtrabile per stagione e tipologia.',
      ],
    ),
  },
];

async function main() {
  let created = 0;

  for (const article of articles) {
    const existing = await prisma.article.findUnique({ where: { slug: article.slug } });
    if (existing) continue;

    await prisma.article.create({
      data: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        body: serializeBody(article.body),
        category: article.category,
        // Foto stock provvisoria dove esiste, vedi src/data/photos.ts.
        coverImage: articleCover(article.slug),
        coverAlt: article.coverAlt,
        tags: JSON.stringify(article.tags),
        status: article.status,
        featured: article.featured ?? false,
        publishedAt: article.publishedAt ? new Date(`${article.publishedAt}T12:00:00.000Z`) : null,
        seoTitle: article.seoTitle ?? article.title,
        seoDescription: article.seoDescription ?? article.excerpt,
      },
    });
    created += 1;
  }

  const total = await prisma.article.count();
  const drafts = await prisma.article.count({ where: { status: 'draft' } });
  console.info(`Seed completato: ${created} articoli aggiunti · ${total} in archivio, ${drafts} bozze.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
