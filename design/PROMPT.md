# Prompt per Claude Code

> Incolla il testo qui sotto in Claude Code, nella cartella del progetto, **dopo aver copiato in quella cartella
> `README.md` e `Mockup IME Service.dc.html` di questo bundle** (es. in `design/`).

---

Devi sviluppare il nuovo sito di **IME Service srls** (Domegliara, Verona): impianti elettrici civili e industriali
+ luminarie artistiche con il marchio *La Fabbrica di Babbo Natale*.

## Materiali
- `design/README.md` — specifica di design completa: token, tipografia, misure, comportamenti, modello dati.
  **Leggila per intera prima di scrivere codice.**
- `design/Mockup IME Service.dc.html` — mockup visivi. Aprilo e guardalo. È un canvas che affianca più schermate:
  ogni schermata sta in un contenitore `.dv-opt` con un id visibile (`2a`, `2b`, …).
  **Il "cromo" del canvas non fa parte del sito**: badge id, etichette `.dv-*`, riquadri tratteggiati
  `.phd`/`.phl` (segnaposto foto). Implementa solo il contenuto dentro ogni `.dv-card`.
  Il **turno 2** (`2a`–`2j`) più la home **`1a`** sono la direzione approvata. Tutto il resto del turno 1
  (`1b`–`1p`) sono esplorazioni scartate: ignorale.

Gli HTML sono **riferimenti di design, non codice da copiare**: ricrea le schermate in React con i pattern del
progetto. Se il progetto è vuoto, usa **Next.js (App Router) + TypeScript + Tailwind** — servono SEO, i18n IT/EN
e rendering statico.

## Cosa costruire
Sito pubblico (8 pagine) + area riservata per le news:

| Rotta | Mockup |
|---|---|
| `/` | `1a` |
| `/luminarie` (tab Natalizie/Eventi + filtri tipologia) | `2a` |
| `/luminarie/[slug]` (scheda soggetto) | `2b` |
| `/soggetti-personalizzati` (form + upload disegno) | `2c` |
| `/news` | `2d` |
| `/news/[slug]` | `2e` |
| `/chi-siamo` | `2f` |
| `/impianti` | `2g` |
| `/lavora-con-noi` | `2h` |
| `/admin/news` | `2i` |
| `/admin/news/[id]` (editor con anteprima live) | `2j` |

## Vincoli non negoziabili
1. **Token prima di tutto.** Porta i colori, la scala tipografica e i letter-spacing del README in
   `tailwind.config` (o in custom properties) e usa **solo** quelli. Zero colori inventati.
2. **Tipografia**: display **Archivo 500**, testo **Work Sans** 300/400/500/600. Self-hosted via `next/font`.
   I letter-spacing ampi sulle maiuscole (`.34em`, `.3em`, `.2em`…) sono la firma dello stile: non ometterli.
3. **Geometria**: `border-radius: 0` su card, bottoni, input e foto; tondo solo su pill/chip e bullet.
   **Nessuna ombra**: la profondità viene dai fondi (`#0a0e1c` / `#10162a` / `#141326`) e dalle hairline.
4. **Un solo colore d'azione**: oro `#f2c66d`. Blu `#233d92` = mondo impianti, rosso `#d31f2e` = mondo Natale,
   mai come colore di bottone.
5. **Header e footer identici** su tutte le pagine pubbliche, con la voce attiva in oro. Dati reali:
   IME Service srls · Via Adige 238, 37015 Domegliara (VR) · P.IVA 04236040236 · Tel. 045 2221396 ·
   Cell. 345 3021563 · info@ime-service.it.
6. **Foto**: non ci sono immagini reali. Crea un componente `<PhotoSlot label="..." ratio="..." />` che replica il
   segnaposto del mockup (fondo `#131a30` + righe diagonali 45°) e riporta l'etichetta descrittiva presa dal
   mockup. Ogni slot deve poi accettare una vera immagine senza cambiare layout.
7. **Loghi**: isola `<LogoIme />` e `<LogoFabbrica />` come componenti singoli (ora sono lockup testuali,
   arriveranno gli SVG ufficiali).
8. **Contenuti in italiano**, con struttura pronta per la traduzione EN (switch IT/EN già in header).
9. **Accessibilità**: focus visibile oro 2px su tutto ciò che è interattivo, contrasto AA sul fondo scuro,
   carosello e twinkle disattivati con `prefers-reduced-motion`, form con label reali (non solo placeholder).
10. **Riusa i componenti**: l'anteprima live dell'editor (`2j`) deve rendere l'articolo con **gli stessi**
    componenti della pagina pubblica `2e`, non con un markup duplicato.

## Ordine di lavoro suggerito
1. Setup progetto, font, token, `<Header>`, `<Footer>`, `<PhotoSlot>`, primitive (Button, Chip, Field, Badge, SectionLabel).
2. Pagine statiche: Chi siamo, Impianti, Lavora con noi (dati in file TS locali).
3. Catalogo: modello `Subject`, lista con filtri in querystring, scheda soggetto, stato "richiesta multipla"
   in contesto + `localStorage`.
4. News pubbliche + modello `Article` + renderer dei blocchi del corpo + SEO/OG/JSON-LD.
5. Form (react-hook-form + zod): preventivo custom con upload, candidatura con CV. Route handler + invio email
   + persistenza. Limiti file come da design (20 MB allegati, 10 MB CV).
6. Area riservata: auth, lista articoli con ricerca/filtri/paginazione, editor con autosave, toggle in evidenza,
   contatori SEO, anteprima live desktop/mobile.
7. Responsive: breakpoint 1200/900/640 seguendo le regole del README. **I mockup mobile non esistono ancora**:
   se una scelta è ambigua, fermati e chiedi invece di improvvisare.

## Definizione di "fatto"
- Affiancando ogni pagina al suo mockup a 1200px non si notano differenze di colore, dimensione tipografica,
  spaziatura o allineamento.
- Nessun valore hardcoded fuori dai token.
- Tutti i form validano, inviano e mostrano un esito.
- L'admin permette di creare, salvare come bozza, pubblicare, modificare ed eliminare un articolo, e ciò che si
  vede in anteprima è identico a ciò che finisce online.
