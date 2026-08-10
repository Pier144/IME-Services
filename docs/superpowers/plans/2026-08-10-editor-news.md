# Editor news dell'area riservata — piano di lavoro

> **Per chi esegue:** i passi usano caselle (`- [ ]`) per essere spuntati. Ogni passo è una
> azione da pochi minuti. Si committa spesso.

**Obiettivo:** rendere l'area riservata usabile dal personale di IME Service — non tecnico, poche
volte l'anno — senza toccare il sito pubblico.

**Architettura:** il corpo dell'articolo resta `BodyBlock[]` con la formattazione inline scritta
come marcatori nel testo. L'editor ricco è un'interfaccia *sopra* quel formato: due convertitori lo
aprono e lo richiudono. Il renderer pubblico non viene toccato.

**Tecnologie:** Next.js 16, React 19, TipTap 3.29.2 (ProseMirror), Zod, Vitest (solo per i
convertitori).

**Specifica:** [2026-08-10-editor-news-design.md](../specs/2026-08-10-editor-news-design.md)

---

## Ordine e perché

I capitoli sono in ordine di rischio crescente. I primi tre si possono rilasciare da soli e
migliorano subito l'area riservata; l'editor arriva quando i convertitori sono dimostrati corretti.

| Capitolo | Rischio | Rilasciabile da solo |
| --- | --- | --- |
| 1 · Quello che non dipende dall'editor | basso | sì |
| 2 · I convertitori | medio | sì (non ancora usati) |
| 3 · L'editor ricco | alto | sì |
| 4 · Immagini nel corpo | medio | sì (inerte senza R2) |
| 5 · Verifica finale | — | — |

---

## Chunk 1: Quello che non dipende dall'editor

### Task 1: Menù ridotto alle pagine che esistono

**File:**
- Modifica: `src/components/admin/AdminSidebar.tsx:23-31`
- Modifica: `src/i18n/dictionaries/it.ts` e `en.ts` (chiavi `admin.nav.*` rimaste inutilizzate)

- [ ] **Passo 1: verificare lo stato di partenza**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/preventivi
```

Atteso: `404`. È il difetto da eliminare.

- [ ] **Passo 2: ridurre l'elenco a ciò che esiste**

In `AdminSidebar.tsx`, `items` diventa:

```tsx
const items = [{ href: adminRoutes.news, label: t.admin.nav.news }];
```

Le voci si rimuovono, non si disabilitano: a chi non è tecnico una voce spenta comunica un guasto
quanto una rotta.

- [ ] **Passo 3: togliere le chiavi rimaste orfane**

Rimuovere da entrambi i dizionari `admin.nav.dashboard`, `.subjects`, `.quotes`, `.applications`,
`.media`, `.settings`. I due file sono gemelli e vanno tenuti allineati.

- [ ] **Passo 4: verificare**

```bash
npm run typecheck && npm run lint
```

Con il sito avviato, nessuna voce del menù deve rispondere 404.

- [ ] **Passo 5: commit**

```bash
git add src/components/admin/AdminSidebar.tsx src/i18n/dictionaries
git commit -m "Riduce il menu dell'area riservata alle pagine che esistono"
```

### Task 2: Non perdere il lavoro

**File:**
- Modifica: `src/components/admin/ArticleEditor.tsx:164-170` (l'avviso attuale) e `:197-202` (il link)

- [ ] **Passo 1: riprodurre la perdita**

Con il sito avviato: aprire un articolo, scrivere una frase, cliccare «← Torna» entro 30 secondi,
riaprire l'articolo. La frase non c'è. È il difetto da eliminare.

- [ ] **Passo 2: «← Torna» salva prima di navigare**

Il `<Link>` diventa un `<button>` che attende il salvataggio:

```tsx
<button
  type="button"
  onClick={async () => {
    if (dirty) await save();
    router.push(adminRoutes.news);
  }}
  disabled={saving}
  className="text-ink-3 transition-colors duration-200 hover:text-gold"
>
  ← {t.admin.editor.back}
</button>
```

- [ ] **Passo 3: salvare anche quando la finestra perde il fuoco**

Accanto all'effetto dell'autosalvataggio:

```tsx
useEffect(() => {
  if (!dirty) return;
  const onBlur = () => void save();
  window.addEventListener('blur', onBlur);
  return () => window.removeEventListener('blur', onBlur);
}, [dirty, save]);
```

`beforeunload` resta dov'è: copre chiusura e ricaricamento, che gli altri due non intercettano.

- [ ] **Passo 4: verificare le tre uscite**

Scrivere una frase e uscire in tre modi — «← Torna», cambio di finestra, ricaricamento. In tutti e
tre il testo deve essere ancora lì alla riapertura.

- [ ] **Passo 5: commit**

```bash
git add src/components/admin/ArticleEditor.tsx
git commit -m "Salva prima di lasciare l'editor invece di perdere il lavoro"
```

### Task 3: Dire cosa manca, non che manca qualcosa

**File:**
- Modifica: `src/components/admin/ArticleEditor.tsx:264-268`
- Modifica: `src/i18n/dictionaries/it.ts` e `en.ts`

- [ ] **Passo 1: usare l'elenco che già esiste**

`publishBlockers()` restituisce `['copertina', 'sommario']`, ma l'interfaccia mostra una frase
generica. Sostituire con una che elenca:

```tsx
{!canPublish && (
  <p className="border-b border-hairline px-24 py-10 font-body text-12-5 font-medium text-ink-4">
    {t.admin.editor.publishMissing.replace('{fields}', missing.join(', '))}
  </p>
)}
```

Nuova chiave, in entrambi i dizionari:
`publishMissing: 'Per pubblicare mancano: {fields}.'`

- [ ] **Passo 2: stato scritto a parole**

Nella topbar, accanto al badge, aggiungere l'esplicitazione: bozza → «non visibile sul sito».

- [ ] **Passo 3: verificare**

Aprire un articolo senza copertina: il messaggio deve nominare la copertina.

- [ ] **Passo 4: commit**

```bash
git add src/components/admin/ArticleEditor.tsx src/i18n/dictionaries
git commit -m "Dice quali campi mancano per pubblicare"
```

---

## Chunk 2: I convertitori

> Questo capitolo non cambia niente di visibile. Prepara e **dimostra** il pezzo su cui poggia
> l'editor.

### Task 4: Vitest, solo per i convertitori

**Decisione da confermare:** il progetto non ha test. Qui se ne aggiunge il minimo indispensabile,
perché i convertitori sono l'unico punto in cui un errore corrompe gli articoli senza accorgersene,
e la specifica chiede l'identità byte per byte. Se si preferisce restare senza test, saltare al
Task 5 e verificare a mano confrontando il JSON prima e dopo.

**File:**
- Crea: `vitest.config.ts`
- Modifica: `package.json`

- [ ] **Passo 1: installare**

```bash
npm i -D vitest
```

- [ ] **Passo 2: configurare**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
```

In `package.json`, fra gli script: `"test": "vitest run"`.

- [ ] **Passo 3: commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "Aggiunge Vitest per i convertitori del corpo articolo"
```

### Task 5: `blocksToDoc` e `docToBlocks`

**File:**
- Crea: `src/lib/articles/tiptap.ts`
- Crea: `src/lib/articles/tiptap.test.ts`

- [ ] **Passo 1: scrivere il test che fallisce**

Il test che conta è il giro completo: dai blocchi al documento e ritorno, senza perdere niente.

```ts
import { describe, expect, it } from 'vitest';
import { blocksToDoc, docToBlocks } from './tiptap';
import type { BodyBlock } from './body';

const casi: BodyBlock[][] = [
  [{ type: 'lead', text: 'Apertura con **grassetto** e *corsivo*.' }],
  [{ type: 'heading', text: 'Come si è lavorato' }],
  [{ type: 'quote', text: 'Tre notti di posa.', attribution: 'Il caposquadra' }],
  [{ type: 'list', items: ['Attraversamenti', 'Portali'] }],
  [{ type: 'image', label: 'FOTO', caption: 'Piazza Bra', src: '/foto/a.jpg' }],
  [{ type: 'paragraph', text: 'Con un [link](https://ime-service.it) dentro.' }],
];

describe('giro completo blocchi → documento → blocchi', () => {
  it.each(casi)('non perde niente: %j', (blocco) => {
    expect(docToBlocks(blocksToDoc([blocco].flat()))).toEqual([blocco].flat());
  });
});
```

- [ ] **Passo 2: verificare che fallisca**

```bash
npm test
```

Atteso: fallisce, `blocksToDoc` non esiste.

- [ ] **Passo 3: implementare i due convertitori**

In `src/lib/articles/tiptap.ts`. Regole:
- `lead` → paragrafo con attributo `lead: true`; `paragraph` → paragrafo normale;
- `heading` → `heading` livello 2 (il design non prevede altri livelli);
- `quote` → `blockquote`, con l'attribuzione in un nodo figlio dedicato;
- `list` → `bulletList`;
- `image` → nodo `image` con `src`, `label`, `caption`;
- i marcatori inline (`**`, `*`, `__`, `[](…)`) diventano marche di TipTap all'andata e tornano
  marcatori al ritorno. Riusare le espressioni regolari di `src/lib/articles/inline.tsx:12-13`
  invece di riscriverle.

- [ ] **Passo 4: verificare che passi**

```bash
npm test && npm run typecheck
```

- [ ] **Passo 5: provarli sui contenuti veri**

Non solo su casi inventati: gli articoli del seed sono la prova migliore.

```bash
npx tsx -e "import {parseBody} from './src/lib/articles/body'; import {blocksToDoc,docToBlocks} from './src/lib/articles/tiptap'; import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); p.article.findMany().then(a=>{let ko=0; for(const x of a){const b=parseBody(x.body); if(JSON.stringify(docToBlocks(blocksToDoc(b)))!==JSON.stringify(b)){console.log('DIVERSO:',x.slug); ko++}} console.log(ko===0?'tutti e '+a.length+' identici':ko+' articoli alterati'); p.\$disconnect()})"
```

Atteso: `tutti e 14 identici`. Se anche uno solo differisce, il convertitore non è pronto e
l'editor non va montato.

- [ ] **Passo 6: commit**

```bash
git add src/lib/articles/tiptap.ts src/lib/articles/tiptap.test.ts
git commit -m "Converte i blocchi del corpo da e verso il documento dell'editor"
```

---

## Chunk 3: L'editor ricco

### Task 6: TipTap con schema vincolato

**File:**
- Crea: `src/components/admin/RichEditor.tsx`

- [ ] **Passo 1: installare**

```bash
npm i @tiptap/react@3.29.2 @tiptap/pm@3.29.2 @tiptap/starter-kit@3.29.2
```

- [ ] **Passo 2: montare l'editor con le sole estensioni previste**

Dallo StarterKit vanno **disattivate** le estensioni che produrrebbero blocchi non rappresentabili:
`codeBlock`, `horizontalRule`, `orderedList`, e i livelli di titolo diversi dal 2. L'editor deve
essere incapace di generare qualcosa che `docToBlocks` non sappia convertire.

- [ ] **Passo 3: barra strumenti**

Riusare l'aspetto di `EditorToolbar.tsx` — stessa fascia, stesso `bg-toolbar-bg`, stesso filetto —
ma i comandi agiscono sull'editor invece di scrivere marcatori nel testo. I pulsanti mostrano lo
stato attivo (`editor.isActive('bold')`), cosa che oggi non è possibile.

- [ ] **Passo 4: commit**

```bash
git add package.json package-lock.json src/components/admin/RichEditor.tsx
git commit -m "Aggiunge l'editor ricco vincolato ai blocchi del progetto"
```

### Task 7: sostituire l'area di testo

**File:**
- Modifica: `src/components/admin/ArticleEditor.tsx:390-406`
- Modifica: `src/app/admin/news/[id]/page.tsx:23-25`
- Elimina: `src/components/admin/EditorToolbar.tsx`

- [ ] **Passo 1: cambiare il tipo del bozzetto**

In `EditorArticle`, `bodyText: string` diventa `body: BodyBlock[]`. La pagina non chiama più
`blocksToText`: passa i blocchi come sono.

- [ ] **Passo 2: sostituire il riquadro**

`<EditorToolbar>` + `<textarea>` diventano `<RichEditor>`. L'anteprima non ha più bisogno del
ritardo di 200 ms né di `textToBlocks`: i blocchi sono già lì.

- [ ] **Passo 3: verificare**

Aprire un articolo esistente: deve apparire formattato, non con i marcatori a vista. Salvare senza
modificare nulla e controllare che `body` nel database non sia cambiato.

- [ ] **Passo 4: commit**

```bash
git add -A src/components/admin src/app/admin
git commit -m "Sostituisce l'area di testo con l'editor ricco"
```

### Task 8: il contratto dell'API passa ai blocchi

**File:**
- Modifica: `src/lib/validation/article.ts:19`
- Modifica: `src/app/api/admin/articoli/route.ts:54` e `[id]/route.ts:68`

- [ ] **Passo 1: cambiare lo schema**

`bodyText: z.string()` diventa:

```ts
body: z.array(z.unknown()).max(500).default([]),
```

La validazione vera resta `parseBlock`, che esiste già e scarta tutto ciò che non riconosce: lo
schema controlla la forma, `parseBlock` il contenuto.

- [ ] **Passo 2: usare i blocchi nelle due route**

`textToBlocks(data.bodyText)` diventa `data.body.map(parseBlock).filter(Boolean)`.

- [ ] **Passo 3: verificare che l'API rifiuti la spazzatura**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH http://localhost:3000/api/admin/articoli/<id> \
  -H "Content-Type: application/json" -d '{"body":[{"type":"script"}]}'
```

Atteso: `401` senza sessione. Con sessione, il blocco sconosciuto va scartato, non salvato.

- [ ] **Passo 4: commit**

```bash
git add src/lib/validation src/app/api/admin
git commit -m "L'API degli articoli riceve blocchi invece di testo con marcatori"
```

### Task 9: rimuovere il ponte

**File:**
- Modifica: `src/lib/articles/body.ts:128-206`

- [ ] **Passo 1: verificare che non le usi più nessuno**

```bash
grep -rn "textToBlocks\|blocksToText" src/ prisma/
```

Atteso: nessun risultato.

- [ ] **Passo 2: eliminare `textToBlocks` e `blocksToText`**

Erano il ponte fra testo con marcatori e blocchi. Il ponte non serve più. Aggiornare il commento in
testa al file, che descrive ancora il formato testuale.

- [ ] **Passo 3: verificare e committare**

```bash
npm test && npm run typecheck && npm run lint && npm run build
git add src/lib/articles/body.ts
git commit -m "Toglie il codice ponte fra testo e blocchi, ora senza utilizzatori"
```

---

## Chunk 4: Immagini nel corpo

### Task 10: trascinare una foto dentro l'articolo

**File:**
- Modifica: `src/components/admin/RichEditor.tsx`

- [ ] **Passo 1: gestire il rilascio**

Al `drop` di un file immagine sull'editor: caricarlo con `POST /api/upload` (esiste già, lo usa il
`Dropzone` della copertina) e inserire il nodo immagine con la chiave restituita.

- [ ] **Passo 2: didascalia modificabile in linea**

Sotto l'immagine, un campo per la didascalia. Sparisce il secondo `window.prompt`.

- [ ] **Passo 3: dire la verità quando fallisce**

Senza R2, in produzione il caricamento fallisce. L'errore deve dirlo in italiano —
«Caricamento non riuscito: lo spazio per le immagini non è ancora configurato» — non lasciare
l'immagine a metà.

- [ ] **Passo 4: verificare in locale**

Con `STORAGE_DRIVER=local`, trascinare una foto e controllare che compaia nell'anteprima e
sopravviva al salvataggio.

- [ ] **Passo 5: commit**

```bash
git add src/components/admin/RichEditor.tsx
git commit -m "Immagini nel corpo trascinando invece delle finestrelle del browser"
```

---

## Chunk 5: Verifica finale

### Task 11: dimostrare che il sito pubblico non è cambiato

- [ ] **Passo 1: il peso delle rotte pubbliche non cresce**

Annotare l'output di `npm run build` **prima** di iniziare, e confrontarlo alla fine. Le rotte
`/[locale]/*` devono avere lo stesso First Load JS: TipTap deve comparire solo su
`/admin/news/[id]`.

- [ ] **Passo 2: il formato salvato è identico**

Ripetere il controllo del Task 5, Passo 5 sul database: 14 articoli, nessuno alterato.

- [ ] **Passo 3: le pagine pubbliche rendono come prima**

```bash
curl -s https://imeservice.netlify.app/news | grep -c "article"
```

Confrontare con il valore precedente al lavoro.

- [ ] **Passo 4: la catena completa**

```bash
npm test && npm run typecheck && npm run lint && npm run build
```

- [ ] **Passo 5: deploy e prova sul sito vero**

Dopo il deploy, scrivere un articolo di prova dall'area riservata e pubblicarlo: è l'unica verifica
che conta davvero.
