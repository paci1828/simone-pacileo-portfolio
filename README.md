# Simone Pacileo Portfolio

Portfolio React + TypeScript, Vite e CSS Modules. Bilingue italiano/inglese,
con tema chiaro/scuro e progetti recuperati dalle API pubbliche di GitHub.
Nessun backend proprio, database o token GitHub nel browser.

## Avvio locale

Richiede Node.js 24 (versione usata per sviluppo e CI) e npm.

```powershell
npm ci
npm run dev
```

Apri l'indirizzo stampato dal terminale, normalmente http://127.0.0.1:5173/.

```powershell
npm test
npm run build
npm run preview
```

La build include il controllo TypeScript. `dist/` contiene il sito statico pronto
per l'hosting. `preview` serve a verificare la build locale, non alla produzione.

## Struttura

```text
.github/workflows/deploy.yml   Build, test e deploy GitHub Pages
public/
  cv/Simone_Pacileo_CV.pdf     Nuovo CV da aggiungere
  favicon.svg
  social-card.svg
src/
  components/
    BrandIcons.tsx            Icone dei profili social
    CvLink.tsx                Download o stato CV in aggiornamento
    Projects.tsx              Elenco, ricerca, filtri e stati delle API
    ReadmeView.tsx            Markdown, HTML sanitizzato e URL relativi
    Mermaid.tsx               Diagrammi caricati su richiesta
  data/
    profile.json              Contatti, bio e formazione IT/EN
    experience.json           Timeline, descrizioni IT/EN e date ISO
    skills.json               Categorie e tecnologie
  hooks/useLoad.ts            Caricamento asincrono con protezione dalle race
  lib/
    github.ts                 API, paginazione, cache e rate limit
    github.test.ts            Test sulle integrazioni e sui percorsi README
    theme.tsx                 Preferenza tema e aggiornamenti del sistema
  locales/it.json
  locales/en.json
  App.tsx                     Header, navigazione, footer e route
  App.module.css              Stili responsive e Markdown
  global.css                  Token di tema e accessibilità
  fonts.css                   Font Inter locale, subset latino
  i18n.ts
  main.tsx
  pages/Home.tsx
  pages/Project.tsx
docs/
  design-contract.md          Direzione e criteri di verifica ECC
  qa/                        Evidenze locali delle verifiche
index.html
vite.config.ts
tsconfig.json
package.json
package-lock.json
```

## Pubblicazione gratuita su GitHub Pages

1. Crea un repository **pubblico** su GitHub, nel tuo account `paci1828`, ad
   esempio `simone-pacileo-portfolio`. Lascialo vuoto, senza README iniziale.
2. In questa cartella esegui (sostituisci il nome se ne scegli un altro):

   ```powershell
   git init
   git add .
   git commit -m "feat: add personal portfolio"
   git branch -M main
   git remote add origin https://github.com/paci1828/simone-pacileo-portfolio.git
   git push -u origin main
   ```

3. Nel repository apri **Settings → Pages → Build and deployment → Source** e
   scegli **GitHub Actions**.
4. Se il primo workflow è partito prima di attivare Pages, apri **Actions**,
   seleziona **Build and deploy portfolio** e usa **Run workflow**.
5. Al termine apri l'URL indicato dal job `deploy`. Per il nome d'esempio sarà
   `https://paci1828.github.io/simone-pacileo-portfolio/`.
6. Ogni push su `main` esegue test, build e pubblicazione. Le pull request
   eseguono solo le verifiche, senza pubblicare.

Il workflow legge `base_path` da `configure-pages` e lo passa a Vite tramite
`PAGES_BASE_PATH`: funziona per repository di progetto, per `paci1828.github.io`
e per domini personalizzati configurati in Pages. Non devi modificare a mano
il nome del repository in `vite.config.ts`.

Per verificare una sottocartella prima del deploy:

```powershell
$env:PAGES_BASE_PATH = '/simone-pacileo-portfolio/'
npm run build
npm run preview
# Apri http://127.0.0.1:4173/simone-pacileo-portfolio/
# In un altro terminale, dopo aver chiuso preview:
Remove-Item Env:PAGES_BASE_PATH
```

Riferimenti ufficiali: [Vite, deploy statico](https://vite.dev/guide/static-deploy.html#github-pages)
e [GitHub Pages, workflow personalizzati](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Aggiornare i contenuti

- **Contatti, biografia, formazione e username**: `src/data/profile.json`.
- **Esperienze**: `src/data/experience.json`. Date `YYYY-MM`; `end: null` indica
  il lavoro attuale. Le date SNAPPER e Luna Labs sono state interpretate come
  settembre/agosto **2026**, anno corrente nella conversazione. Correggere qui
  se l'anno inteso era diverso.
- **Competenze**: `src/data/skills.json`. Le voci iniziali sono basate sul CV
  e sul ruolo dichiarato. Hibernate/JPA, PostgreSQL, JUnit, Mockito, Gradle e
  CI/CD non sono stati attribuiti senza conferma: aggiungili se pertinenti.
- **Testi UI**: `src/locales/it.json` e `en.json`.
- **CV**: aggiungi il nuovo PDF in `public/cv/Simone_Pacileo_CV.pdf` e imposta
  `"cvAvailable": true` in `src/data/profile.json`. Fino ad allora il pulsante
  mostra "CV in aggiornamento". Il CV originale non è incluso, come richiesto.
- **Aspetto**: token in `src/global.css` e layout in `src/App.module.css`.
- **SEO**: titolo e metadati in `index.html`, titolo delle route nei componenti.
  Dopo il deploy è consigliato impostare `og:url` e un `og:image` assoluto
  PNG/JPEG: il file SVG incluso è un'immagine base, ma alcuni social non la
  usano per le anteprime. L'URL definitivo non è stato inventato.

Email e LinkedIn sono già compilati. I dati personali sono configurabili;
solo il saluto grafico nel hero usa il nome direttamente nel componente.
Nessun telefono o indirizzo di casa viene mostrato nel testo della pagina.

## Decisioni tecniche

- **HashRouter**: route `/#/progetti/nome` aggiornabili con refresh senza
  fallback server o file 404. Le sezioni usano `/#/#projects` ecc. per mantenere
  una sola home e i dettagli separati, compatibili con GitHub Pages.
- **Cache di tre ore** in localStorage, con fallback in memoria se lo storage
  non è disponibile. Le richieste contemporanee allo stesso endpoint sono
  deduplicate. Nessuna richiesta a ogni render e nessun token esposto.
- **Errori e rate limit**: fallback alla cache obsoleta segnalato all'utente,
  messaggio con ora di reset per i limiti GitHub, recupero manuale con Riprova.
  Un 404 non ripristina dati rimossi dalla cache. Pagine già ricevute restano
  disponibili se una pagina successiva fallisce, con avviso di elenco parziale.
- **Repository**: tutte le pagine da 100, ordinate per `updated_at`. Nessun dato
  fittizio quando GitHub non risponde. Un fork è incluso solo se il README ha
  SHA diverso dal README del parent, o se il parent non ha un README. È una
  definizione operativa di "personalizzato", non una valutazione editoriale.
  Errori nella verifica dei fork producono un avviso. La prima visita di un
  account con molti fork può richiedere più richieste e raggiungere il limite.
- **Linguaggi**: la card mostra il principale restituito nell'elenco; il
  dettaglio carica tutti i linguaggi con la ripartizione percentuale in byte.
- **README**: decodifica UTF-8, tabelle/task list GFM, HTML attraverso
  `rehype-raw` e `rehype-sanitize`. Script, handler inline e iframe non vengono
  eseguiti. Le immagini relative usano raw.githubusercontent.com, i link
  relativi github.com/blob sul branch predefinito e la cartella del README.
  Gli indici con ancore scorrono ai titoli senza cambiare la route HashRouter.
  Link assoluti e ancore restano invariati. Mermaid è lazy e usa modalità
  `strict`; diagrammi non validi mostrano il sorgente. Le immagini SVG normali
  restano immagini, non vengono iniettate come HTML.
- **Demo**: viene usato `homepage` del repository, in alternativa il primo
  link Markdown con etichetta demo/live/website/try it. Gli altri link nel
  README restano cliccabili. HTML complesso, include esterni e funzionalità
  specifiche di GitHub non hanno necessariamente un equivalente nel browser.
- **Prestazioni**: route separate, Mermaid caricato soltanto quando un README
  lo richiede, font locali, immagini lazy. Nessun asset remoto decorativo.
- **Accessibilità**: link per saltare al contenuto, HTML semantico, etichette,
  tastiera, focus visibile, menu con Escape, reduced motion e temi responsive.
- **SEO**: base per una SPA statica. Le anteprime dei singoli README non hanno
  HTML prerenderizzato; per indicizzazione per progetto serve in futuro SSG.

## Workflow ECC applicato

Direzione e criteri visuali: `frontend-design-direction`. Pattern dei componenti
React: `frontend-patterns`. Configurazione build: `vite-patterns`. Verifiche
con browser, screenshot e test dei confini API. I file del plugin sono stati
consultati nell'installazione locale di ECC, senza installazioni duplicate.

Repository di pubblicazione: `paci1828/simone-pacileo-portfolio`.
Hosting configurato con GitHub Pages e GitHub Actions.
URL del sito: https://paci1828.github.io/simone-pacileo-portfolio/

## Verifiche eseguite

13 test Vitest: cache, deduplicazione, storage non disponibile, errori,
rate limit, paginazione completa/parziale, fork e percorsi README.
Build TypeScript/Vite e verifiche browser a 1440×900 e 390×844.
Le API live sono state verificate con il browser ECC; i test di interazione
locali usano una registrazione delle stesse risposte pubbliche per essere
ripetibili. Gli stati di errore e i diagrammi usano fixture di prova.
Lighthouse ECC: accessibilità, SEO e best practices 100/100 nei due viewport.
Mermaid rimane lazy: la build avvisa del modulo opzionale ELK da circa 1,46 MB,
che non viene caricato nella home e serve ai diagrammi che lo richiedono.
Tre dei cinque repository verificati non hanno un README; il sito mostra
un messaggio dedicato e il link al codice.
Evidenze e limiti sono registrati localmente in `docs/qa/`. Questa cartella
è esclusa da Git per mantenere nel repository solo i sorgenti e la documentazione.
