# Antagelser og beslutninger

Det, der blev besluttet undervejs uden et svar fra dig. Hvert punkt kan ændres ét sted; hvor, står ved punktet.

## Arbejdsgangen

- **Faserne er bygget i ét stræk** efter din besked, i stedet for at stoppe efter hver fase. Hver fase har sin branch `feature/faseN` i begge repoer, og hver branch er lavet **oven på den forrige**, ikke fra `main`. Merge dem i rækkefølge: `feature/fase0` → `main`, derefter `feature/fase1` osv.
- **Det deployede site er ikke verificeret af mig.** Jeg logger ikke ind med adgangskoder og har ikke databasens adgangskode, og der deployes først, når du merger til `main`. Det, jeg har verificeret, står i afsnittet *Verifikation* pr. fase nedenfor.

## Fase 0 — Fundament

- **Den første bruger** oprettes af konfigurationen `Access:BootstrapAdminEmails`: en e-mail på listen bliver `EventManager` ved første login. Uden det kan ingen oprette den første række i `users`. (`AccessOptions`, `KnownUserMiddleware`.)
- **En eksisterende bruger bindes til sin Supabase-konto ved første login** via e-mailen; derefter slås vedkommende op på Supabase-id'et. En administrator kan derfor oprette en bruger, før personen har en Supabase-konto.
- **Kun lyst tema.** Systemet bruges i dagslys; et mørkt tema er ikke bygget.
- **Verifikation:** build uden advarsler; `/health` 200; `/api/me` uden token 401; forfalsket token 401 (nøglerne hentes fra det nye Supabase-projekt); CORS-preflight fra `localhost:5173` 204; migrationen `InitialUsers` anvendt gennem connectoren, advisors uden fund; login-siden kontrolleret i 375 px.

## Fase 1 — Kunder og bookinger

- **Kundens navn er parret som én enhed** ("Tobias og Cecilie"). Kontaktpersonerne er de enkelte personer med e-mail og telefon; den første tilføjede bliver primær.
- **"Underskrevet" kan ikke vælges i hånden.** Det sættes, når den underskrevne aftale uploades (fase 4). De øvrige salgstrin vælges frit, også tilbage.
- **Gæsteantal 1–350**, fordi laden har plads til 350. Håndhævet i domænet og som check-constraint i databasen.
- **Samme dato:** afbestilte og tabte bookinger tæller ikke med i advarslen.
- **Samtidige rettelser** giver 409 med "Ændret af en anden" og en knap til at hente den nyeste udgave (Postgres' `xmin`).
- **Verifikation:** build og typecheck rene; migrationen `CustomersAndBookings` anvendt gennem connectoren; advisors: ingen sikkerhedsfund, kun "ubrugt indeks" på de nye tabeller. Oprettelse, søgning og advarsel kræver login mod en database og er ikke kørt af mig.

## Fase 2 — Pakker og pris pr. gæst

- **Tillægget under 60 gæster er et fast beløb pr. booking** (ikke pr. gæst), fordi det dækker faste opstartsomkostninger. Grænse og beløb sættes af en ejer eller event manageren under *Pakker*. **Beløbet 7.500 kr. er en pladsholder** — det rigtige tal kendes ikke (§11.4).
- **Tillægget kopieres ind på bookingen, når den oprettes**, ligesom priserne. En senere ændring af tillægget rører ikke eksisterende bookinger. En booking uden linjer har ingen pris og derfor intet tillæg.
- **Prislisten 2026 er lagt ind som startdata** med priserne fra kravene: grundpakke 1.495 kr./gæst, natmad 100 kr., spiritus og cocktailbar 155 kr. **Fredagsarrangementets pris (250 kr./gæst) er opdigtet**; minimum 30 gæster håndhæves. 2027-priser laves med *Kopiér til et nyt år*.
- **Fredagsarrangementet har sit eget antal** (fast antal, minimum 30), fordi det er for de nærmeste — ikke alle bryllupsgæster.
- **Priser og prisliste er kun for event manager, ejere og bogholder.** Kok og event producer får bookingens linjer (menuen) men intet prisfelt i svaret — allerede fra denne fase.
- **Oprettelse og rettelse** af bookinger, kunder og pakker er for event manager og ejere.
- **Verifikation:** 11 domænetests grønne, bl.a. 80 → 94 gæster i én rettelse, uændret booking efter prisændring på pakken, tillæg ved 55/59 og ikke ved 60. Migrationen `PackagesAndLines` anvendt; advisors uden sikkerhedsfund.

## Fase 3 — Betalingsplan og simuleret regnskab

- **33 %-raten er 33 % af hele prisen**, og reservationsgebyret trækkes fra i restbetalingen (§11.1). Raten rundes til hele kroner; restbetalingen tager resten, så raterne altid summerer til totalen.
- **Når en rate er faktureret, ligger beløbet fast** — regnskabet ejer det. Ændres gæsteantallet bagefter, lander forskellen på restbetalingen. Falder prisen under det allerede fakturerede, bliver restbetalingen negativ og vises som et beløb, der skal tilbage.
- **Er prisen under 25.000 kr.**, er gebyret hele prisen. En booking uden pris har en plan på 0 kr.
- **Reservationsgebyrets forfald er 8 dage efter booking.** Bookes et bryllup under 6 måneder før, forfalder 33 %-raten ved underskrift, eller ved booking indtil der er skrevet under (§11.5).
- **Nye bookinger får nye betingelser** (§11.3); gamle betingelser vælges pr. booking.
- **"Dato sikret" kræver kun, at gebyret er betalt**, som i §4. Underskriften er sit eget salgstrin (fase 4); begge dele kræves, rækkefølgen er fri (§11.2).
- **"Betaling forfalden"** kræver en bogført, ubetalt faktura med forfaldsdato før i dag (dansk tid). En rate, der ikke er faktureret endnu, er ikke forfalden.
- **Tilbud sendes fra regnskabet**, ligesom i e-conomic, hvis API ikke kan sende tilbud. Det simulerede regnskab har en side *Regnskab*, hvor et tilbud markeres som sendt og en indbetaling registreres. En faktura sendes, når den bogføres.
- **Nyt tilbud** laver et nyt tilbudsnummer; det nyeste er det gældende.
- **Integrationstests** (§10, "når der er tid") er skrevet: det rigtige API mod en rigtig Postgres, med tokens signeret af en testnøgle i stedet for Supabase. De springes over uden en testdatabase og kører ikke i pipelinen.
- **Verifikation:** 31 domænetests (bl.a. raterne summerer til totalen for 1–350 gæster med begge betingelser) og 14 integrationstests grønne mod en midlertidig lokal Postgres — heriblandt hele forløbet til fuld betaling og at bookingtabellerne ingen status- eller beløbskolonner har. Migrationerne `AccountingReferences` og `InitialSimulatedAccounting` er anvendt på Supabase; advisors uden sikkerhedsfund.

## Fase 4 — Aftalebekræftelse

- **Underskriften sker på PDF, der sendes retur på mail** (§11.7). Den underskrevne PDF uploades på bookingen; det sætter salgstrinnet *Underskrevet* og tidspunktet, som 33 %-raten bruger for et sent bookedet bryllup.
- **Filerne gemmes i Postgres** (`app.stored_files`) bag API'ets adgangskontrol, **ikke i Supabase Storage**. API'et skal så ikke have en storage-nøgle, og mængden er lille (få hundrede aftaler om året). En Storage-adapter kan sættes ind bag `IFileStore` uden andre ændringer.
- **Aftalen viser priser og betalingsplan**, fordi den afløser det dokument, der vedhæftes tilbuddet. Den er derfor kun for rollerne, der ser priser.
- **Præciseringen gemmes på bookingen** og kopieres ind i hver version, så man ser, hvad der stod i den version, der blev skrevet under.
- **"Vedhæft til tilbud"** lægger aftalen på det nyeste tilbud i regnskabet og afvises, når tilbuddet ikke længere er en kladde — som i e-conomic.
- **QuestPDF bruges under Community-licensen** (§11.9); licensen skal afklares, før godset bruger det i drift.
- **Verifikation:** 17 integrationstests grønne (ny version efter rettet gæsteantal bevarer den gamle; underskrevet PDF uploades og hentes byte for byte; en fil, der ikke er PDF, afvises; bilag afvises på et sendt tilbud). En genereret aftale er læst igennem: parret, adresse, kontakter, dato, 94 gæster, hver linje, præciseringen og raterne står der. Migrationen `Agreements` anvendt; advisors rene.

## Fase 5 — Klargøring og roller

- **Hver booking får fem klargøringspunkter**, et pr. del af Trello-kortet: kontakt, opdækning og opstilling, pynt og blomster, mad (menu, kuverter, allergier) og efterfakturering. Event manager og ejere kan tilføje flere. Eksisterende bookinger fik punkterne i migrationen.
- **"Klar til afholdelse"** = alle punkter undtagen efterfakturering er *Færdig*. Efterfakturering kommer efter festen.
- **"Afventer efterfakturering"** = datoen er passeret, og efterfaktureringspunktet står *I gang* (der er tillæg, som mangler at blive faktureret).
- **Hvem retter hvad:** event manager og ejere alt; kokken mad og allergier; event produceren kontakt, opdækning og pynt; bogholderen efterfakturering. Alle kan læse klargøringen. Håndhævet i domænet (403), ikke kun skjult i brugerfladen.
- **Kok og event producer ser ikke betalingsbaserede statusser** ("Dato sikret", "Betaling forfalden"), fordi de ikke må se betalinger. De ser salgstrin og klargøring.
- **Brugeradministration** er bygget her: event manager og ejere opretter brugere med e-mail og rolle og kan lukke adgangen. Ingen kan ændre sin egen rolle eller lukke sin egen adgang.
- **Verifikation:** 42 domænetests og 21 integrationstests grønne — bl.a. at intet felt i kokkens svar (booking, liste, klargøring, kunde) indeholder en pris eller et beløb, at alle punkter færdige giver *Klar til afholdelse* uden at nogen sætter det, og at kokken kan rette mad men får 403 på opdækning. Set i browseren som kok. Migrationen `Readiness` anvendt; advisors rene.

## Fase 6 — Kommunikation

- **Mail går til en simuleret udbakke** (§11.8, `mail_sim.outbox`) og forlader ikke systemet. Siden *Udbakke* viser dem præcis, som de ville være sendt. En one.com-SMTP-adapter kan sættes ind bag `IMessageSender`.
- **Afsenderen er den, der trykker Send**; svar går til vedkommendes e-mail (Reply-To).
- **Fire standardtekster er lagt ind** — svar på forespørgsel, mødebekræftelse, tilbud og opfølgning — skrevet ud fra mødet. Johan retter dem under *Tekstbidder*.
- **En pladsholder uden værdi bliver stående i teksten** (fx `{{fremvisning}}`, hvis der ikke er booket en fremvisning) og vises som en advarsel, så den ses før afsendelse i stedet for at blive sendt tom.
- **Fremvisningens vært** vælges på bookingen; er ingen valgt, bruges den første aktive event producer (Bryan). Mødebekræftelsen sætter værten på CC og hans telefonnummer i teksten. At booke en fremvisning flytter en forespørgsel til *Fremvisning aftalt*.
- **Noter kan skrives af alle roller** (Bryan noterer et opkald); mails sendes kun af event manager og ejere. Noter redigeres og slettes ikke — de er historikken.
- **Verifikation:** 43 domænetests og 23 integrationstests grønne — mødebekræftelsen har Bryan på CC og hans nummer i teksten, et udkast sender intet, den redigerede tekst er det, der sendes, og mailen står i historikken med tid og modtagere. Set i browseren. Migrationerne `Communication` og `InitialSimulatedMail` anvendt; advisors rene.

## Fase 7 — AI-resumé

- **Den selvstændige side `/resume` kræver ikke login** og rører ikke databasen, som kriteriet siger. Endepunktet er det eneste ud over `/health`, der er åbent, og det er **rate-begrænset til 5 kald i minuttet pr. adresse**, så det ikke bliver en åben dør til godsets OpenAI-konto. Det kan slås fra med `Summary:StandaloneEnabled=false`.
- **Modellen skriver ingen tal.** Den får bookingens data til orientering, men instrueres i ikke at gentage gæsteantal, datoer eller beløb; de vises i en separat boks "Fra bookingen", som API'et selv skriver ud fra de strukturerede data.
- **Resuméet gemmes aldrig af sig selv.** "Gem som note" er et bevidst tryk og gemmer det som en intern note.
- **Uden OpenAI-nøgle** bruges en fast adapter, der tager bookingens data og tekstens egne sætninger efter enkle regler — tydeligt mærket "Uden AI". Med nøglen (`OpenAI__ApiKey` i App Service) bruges OpenAI med struktureret output (model `gpt-4.1-mini`, kan ændres med `OpenAI__Model`). **Jeg har ingen OpenAI-nøgle og har derfor ikke kaldt OpenAI**; adapterens forespørgsel og svarparsing er testet mod en stub.
- **Kok og event producer** får resuméet uden pris- og betalingslinjer.
- **Verifikation:** 26 integrationstests grønne (siden uden login, bookingens tal fra bookingen, intet gemt); siden set i browseren uden login.

## Fase 8 — Trello

- **Engangsimport, derefter udfasning** (§11.6). Trello læses kun; intet skrives tilbage.
- **Kilden er bordets JSON-eksport** (Trello → Eksportér som JSON), som virker uden nøgle. Er `Trello__ApiKey` og `Trello__Token` sat, kan bordet også hentes direkte med bord-id. Begge veje giver samme format og samme import.
- **Sådan læses et kort:** gæsteantal fra et brugerdefineret felt (fx "Antal gæster") ellers "80 pax"/"80 gæster" i navn eller beskrivelse; dato fra et datofelt, kortets forfaldsdato eller en dato i navn/beskrivelse ("12.06.2027", "14/8", "3. juli" — året fra bordets navn); parrets navn fra kortets navn uden "Bryllup", antal og dato; e-mails og telefonnumre fra beskrivelsen bliver kontaktpersoner. Tjeklister bliver klargøringspunkter: alle punkter tjekket = *Færdig*, nogle = *I gang*.
- **Et kort uden dato eller gæsteantal importeres ikke**, men står i rapporten med grunden — hellere et kort, Johan retter i Trello og importerer igen, end en booking med et gættet gæsteantal. Arkiverede kort og skabelonkort springes også over med grunden.
- **Kort i en liste, der hedder noget med "bekræft", "underskrev", "booket", "afholdt" eller "klar"**, importeres som *Underskrevet*; resten som forespørgsel. Alle importerede bookinger får nye betingelser; gamle betingelser rettes pr. booking (§11.3).
- **Trellos labels (fx "faktura betalt") og beskrivelsen gemmes som en note** på bookingen. Betalingsstatus tages ikke fra labels, men fra regnskabet.
- **Importen kan køres igen**: et kort, der allerede er importeret, genkendes på sit Trello-id og springes over.
- **Verifikation:** 52 domænetests (fortolkningen af navne, datoer, felter og tjeklister) og 27 integrationstests grønne — med opdigtede eksporter af *Bryllup 26*, *27* og *28* står alle 7 kort enten som importeret eller i tørløbsrapporten med en grund, og en ny kørsel importerer intet. Migrationen `TrelloOrigin` anvendt; advisors rene. **Importen er ikke kørt mod de rigtige Trello-bord**, som jeg ikke har adgang til.

## Fase 9 — Computer og telefon

- **Kun sider, der har brug for bredden, bliver brede** (bookinglisten og bookingsiden, op til 1280 px indhold). Formularer og de øvrige sider bliver ved 896 px, fordi et felt over hele skærmen er sværere at læse. En side gøres bred med `handle: { wide: true }` på sin route.
- **Bookingsiden på computer:** bryllup, indhold, klargøring, aftale og resumé til venstre; betaling, salgstrin, kontakt og historik til højre. Sidekolonnen er ikke låst fast, fordi betaling og historik tilsammen er højere end skærmen; den ruller med siden.
- **Kun bookinglisten er en tabel** — det er den, kriterierne kræver. Kunder, pakker og regnskab er stadig lister, der fylder bredden; de kan få samme tabel, når der er behov.
- **Tastatur:** tabellens kolonneoverskrifter er knapper, og parrets navn i hver række er et link, så alt nås med Tab og Enter. Formularer var allerede rigtige formularer og sendes med Enter.
- **Backend-repoet har ingen ændringer i denne fase**; `feature/fase9` er oprettet der for at holde navnene ens.
- **Verifikation:** set i browseren med opdigtede data. Ved 1440 × 900 er bryllup, pris, status og hele betalingsplanen til og med "I alt" synlige uden at rulle (bunden ved 890 px). Tabellen sorterer stigende og faldende med `aria-sort`. Alle 14 sider har ingen vandret rulning på 375 og 1440 px. Typecheck og lint rene.
