# Projekt: Bookingsystem til bryllupper på Engestofte Gods

Denne prompt beskriver hele projektets omfang. Den er skrevet ud fra et kundemøde med godsets event manager og er kilden til sandhed for, hvordan processen foregår i dag. Hvor noget er uklart, står det under **Åbne spørgsmål** — gæt ikke, spørg mig.

---

## Kontekst

Engestofte Gods ligger på Lolland ved Maribo-søerne og ejes af en familie. **Bryllupper er kerneforretningen**, og det er dem, dette projekt handler om. Godset laver også konferencer, sommerhusudlejning, jagt og et stort julemarked — intet af det er med.

Bryllupper holdes i den gamle kornlade (plads til op til 350 spisende) med reception i en bygning kaldet værkstedet. Der er et industrikøkken.

- **Sæson:** weekender i maj, juni, august og september. **Juli er lukket.** Godset skal tjene stort set alle sine penge på det begrænsede antal weekender.
- **Størrelse:** historisk ca. 85 gæster i gennemsnit, fra omkring 30 til 160. Trenden går mod mindre bryllupper (50–60 gæster).
- **Bookinghorisont:** typisk 1–1½ år frem. Der er bookinger i 2027 og forespørgsler på 2028 og 2029.

### Organisationen

Lille, og alle har mange kasketter.

| Person | Rolle | Forhold til systemet |
|---|---|---|
| **Johan** | Event manager og jurist. Første kontakt, laver aftaler, planlægger. | **Hovedbrugeren.** Det meste af den manuelle indtastning er hans. |
| **Bryan** | Event producer. Fremvisninger og den praktiske afvikling. | Læser detaljerne før og under brylluppet. |
| **Kenneth** | Kok. | Skal se menu, kuverter og allergier. |
| **Bogholderen** | Fakturerer i regnskabssystemet, tjekker indbetalinger. | Skal se betalingsstatus. |
| **Mette og Lise** | Ejerne. Mette er CEO. | Overblik. |

Derudover en ekstra køkkenmand, en sæsongartner og en pulje af tjenere, der ikke bruger systemet.

---

## Sådan foregår det i dag

Forstå dette, før du designer noget.

1. **Forespørgsel.** Et brudepar finder godset — typisk via Instagram, bryllupsmessen eller Bryllupsmagasinet — og skriver eller ringer: *"Vi hedder Tobias og Cecilie, vi skal giftes i 2028, vi er 80 gæster, har I ledige datoer?"*
2. **Svar med grundpakke.** Johan svarer med en standardtekst fra sit bibliotek af tekstbidder, skriver navnene ind og vedhæfter grundpakken: priser, minimumspakke og tilkøbsmuligheder.
3. **Fremvisning.** Han tilbyder en fremvisning på godset — oftest ved Bryan. Han sender endnu en standardtekst som mødebekræftelse med tid og sted, **Bryan på CC og Bryans telefonnummer i teksten**, så parret kan få fat i ham på dagen. Hører han intet bagefter, følger han op.
4. **Tilbud.** Vil parret gå videre, beder Johan om navn, adresse og telefon og **opretter dem som kunde i e-conomic**. Han laver et tilbud ud fra varegrupper — typisk reception om eftermiddagen efter vielsen, eventuelt vielse på godset, middag og fest i laden, og nogle gange morgenmad dagen efter. Parret skal se det samlede beløb *før* de betaler noget, fordi priser pr. person hurtigt løber op, når de ganges med 80.
5. **Aftalebekræftelse.** Fordi Johan er jurist, vil han have præcist nedskrevet, hvad der er aftalt — hvad "morgenmad til alle gæster" konkret indeholder. Han bruger et standard Word-dokument, sletter det irrelevante, præciserer resten, og **taster igen navn, adresse og telefon ind** fra kundekortet.
6. **Afsendelse til underskrift.** Han vedhæfter aftalebekræftelsen og de generelle betingelser til tilbuddet i e-conomic og sender det derfra med en fast skabelontekst. Parret skal skrive under og sende retur. Der kan være frem og tilbage — *"vi venter lige med morgenmaden"* — og så laves aftalen uden, og det tilføjes senere.
7. **Reservationsgebyr.** Bogholderen laver en faktura på 25.000 kr. i e-conomic. **Når den er betalt, er datoen sikret. Når det underskrevne tilbud er kommet retur, er der en aftale.**
8. **Trello.** Hvert bryllup er et kort på et årsboard (*Bryllup 26*, *Bryllup 27*, *Bryllup 28*), oprettet fra en skabelon og navngivet fx *"Bryllup 80 pax"*. Kortet har underpunkter: **kontakt, opdækning og opstilling, pynt og blomster, mad** (menu, kuverter, allergier — vegetarer, gluten, laktose) og **efterfaktureringer**. Hvert punkt markeres **grønt, når det er klar**, halvgrønt når det er i gang. **Når alt er grønt, er brylluppet klar til afholdelse**, og Bryan og driften overtager. Trello er det eneste fælles sted — *"nervecentret"* — og personalet på dagen bruger det som eneste kilde.
9. **Fakturering og betaling.** Johan noterer fakturanumre på kortet. Når en faktura er betalt, tager bogholderen **et skærmbillede af indbetalingen i Jyske Banks netbank**, laver det til PDF og lægger det på kortet. Labels viser status (*faktura afsendt* → *faktura betalt*) og hvem der har ansvaret (fx Johan, Kenneth).
10. **Efterfakturering.** Efter festen kan der komme tillæg, som noteres på et særskilt punkt på kortet.

### Mail

Hver booking får sin egen mappe i Johans mail (*Arrangementer 28 → Bryllupper → parrets navn*), og al korrespondance lægges derind. Han har en mappe *Ekspederet* og sætter en stjerne på det, han skal følge op på. Skriver et par *"vi bliver 73 i stedet for 75, og kan vi få en avec til kaffen?"*, så læser han mailen, retter i Trello, svarer og arkiverer mailen.

---

## Problemerne

I prioriteret rækkefølge, med Johans egne ord hvor de siger det bedst.

1. **Samme oplysninger tastes ind flere gange.** Kunden i e-conomic, igen i aftalebekræftelsen, igen i Trello — og i Trello både i det overordnede felt *og* under mad og kuverter. **Gæsteantallet ændrer sig tit**, og så skal det rettes flere steder. *"Udover det selvfølgelig er tidskrævende og irriterende, så åbner jeg jo også op for fejl, fordi jeg måske nogle gange glemmer en enkelt en af dem."* Det er den største smerte, og den skal løses først.
2. **Trello bliver opdateret for sent.** Når en kontrakt er underskrevet, har Johan ofte for travlt til at fylde kortet ud. Det bliver gjort i januar–februar, når Bryan går alle kontrakterne igennem. Indtil da ligger oplysningerne kun i mails og e-conomic.
3. **Ingen samlet historik.** *"Jeg snakker med nogen i september 2027, de skal giftes i 2028, vi aftaler en hel masse, de betaler reservationsgebyret og skriver under. Vi snakkes ved efter nytår. Ringer de så pludselig i november, så skal jeg nogle gange lige tilbage og læse: hvordan var det nu, hvor var det, vi stod?"*
4. **Betalingsstatus spores i hånden.** Skærmbilleder fra netbanken og labels i Trello i stedet for at læse status direkte fra regnskabssystemet.
5. **Alt er personafhængigt.** Kun Johan kender processen, og kun han kan gøre det i det tempo. Ejerne kender systemet, men det hviler på én person.
6. **Mobil er afgørende.** *"Det er rigtig vigtigt, at det kan bruges fra en smartphone, og at det er nemt både at tilgå og rette i. Det er absolut alfa omega."* Personalet bruger kun Trello digitalt, også under opstilling og afvikling.

---

## Forretningsregler

Disse skal systemet kende og håndhæve — ikke bare vise.

### Betaling

- **Reservationsgebyr: 25.000 kr.** ved booking. Betalingen sikrer datoen. Gebyret **modregnes i den endelige faktura** og **mistes ved afbestilling**.
- **Nye betingelser (fra 2026):** **33 % af brylluppets pris 6 måneder før** afholdelse, og **resten 30 dage før**, så alt er betalt, før festen starter.
- **Gamle betingelser:** hele beløbet 30 dage før.
- **Begge sæt betingelser findes samtidig** i de eksisterende bookinger. Nogle har fået tilbud på de gamle, nogle på de nye. **Systemet skal vide pr. booking, hvilke betingelser der gælder**, og udregne betalingsdatoerne derefter. Johan overvejer i dag at tilføje et ekstra Trello-punkt til betalingsdato alene for at holde styr på det.

### Priser

- Grundprisen er pr. gæst. I 2026: **1.495 kr. for en treretters menu med vand, vin og øl ad libitum.**
- Tilkøb pr. gæst, fx **natmad (~100 kr.)** og **spiritus og cocktailbar (~155 kr.)**.
- **Under 60 gæster gives et tillæg** oven i grundprisen, fordi godset har faste opstartsomkostninger uanset størrelse. (Godset overvejer at revidere dette, fordi bryllupperne bliver mindre.)
- **Fredagsarrangement** kan tilkøbes: let grill aftenen før for de nærmeste, **minimum 30 gæster**.

---

## Hvad systemet skal kunne

### Kerne: én sag pr. bryllup

- **Én samlet booking pr. bryllup**, oprettet én gang: brudeparret, dato, gæsteantal, valgte pakker og tilkøb.
- **Parret er to personer, ikke ét navn.** Hver har sit eget navn, sin e-mail og sit telefonnummer. De skrives aldrig sammen i ét felt, for når parret siger ja til stedet, skal den ene kunne udpeges som **betaleren** — den, der står på tilbud og faktura. Adressen hører til betaleren.
- **Ét gæsteantal, der opdaterer alt, der afhænger af det** — pris, tilbud, aftalebekræftelse, køkkenets kuverttal. Det er projektets vigtigste enkeltkrav.
- **Genkend tilbagevendende kunder.** Et par, der kommer igen, er den samme kunde, ikke en ny.
- **Statusoverblik pr. booking**, så man kan se, hvor i forløbet et par er: forespørgsel → fremvisning → tilbud sendt → underskrevet → reservationsgebyr betalt → 33 %-rate → fuld betaling → afholdt → efterfaktureret.
- **Klargøring pr. booking** — det, Trello-kortets grønne felter gør i dag: kontakt, opdækning og opstilling, pynt og blomster, mad og allergier. **"Klar til afholdelse" skal være noget, systemet kan se, når alt er færdigt**, ikke noget nogen sætter i hånden.
- **Notater og historik pr. booking** — hvem talte med parret, hvornår, om hvad.
- **Rollestyret adgang** til medarbejderne. Kokken skal se menu og allergier; bogholderen skal se betaling; Johan og ejerne skal se alt.
- **Mobilvenligt fra starten.** Ikke en tilpasning bagefter.

### Bestilling udefra

I dag skriver eller ringer parret, og Johan taster alt ind. Bookingen skal i stedet **komme fra parret selv** — Johan skal stadig kunne oprette en sag i hånden, når nogen ringer.

- **To slags bestillinger**, som hjemmesiden linker til:
  - **Bestil en fremvisning.** Parret vælger en ledig tid og kommer ud og ser godset.
  - **Book brylluppet.** For par, der ved, de vil holde det på Engestofte, uanset om de har set stedet. Parret vælger en ledig dato.
- **Begge personer udfylder navn, e-mail og telefon** hver for sig, plus ønsket dato og forventet gæsteantal.
- **En bestilling er en ny sag, som Johan tager stilling til.** Den bekræftes eller afvises af et menneske; tiden eller datoen holdes imens, så ingen andre kan tage den.
- **Fra fremvisning til booking.** Synes parret om stedet, åbner Johan fremvisningen og bekræfter den som booking. Sagen, de to personer og historikken følger med — der oprettes ikke en ny kunde. Derfra går bookingen gennem det almindelige forløb: pakker, tilbud, aftale, reservationsgebyr.
- **Parret ser kun ledig og optaget** — aldrig hvem der har booket en dato.
- **Intet svar sendes automatisk.** Parret får en kvittering på skærmen; bekræftelsen sender Johan selv, efter han har set teksten.

### Kalender

- **Én kalender over godset**, som Johan kan se fra telefonen: bryllupper, fremvisninger og blokeringer (ferie, andre arrangementer).
- **Systemet finder tiden.** Ud fra hvornår værten (normalt Bryan) kan vise rundt, og hvad der allerede er optaget, foreslår systemet de næste ledige fremvisningstider — både til Johan og til parret i formularen.
- **Ledige bryllupsdatoer** følger sæsonen — weekender i maj, juni, august og september; juli er lukket — minus de datoer, der allerede er sikret.

### Regnskab

Kunden bruger **e-conomic**. Vi har ikke adgang til det — og heller ikke til alternativet Dinero — i projektperioden. Derfor:

- **Al regnskabsintegration ligger bag én grænseflade**, formet efter bookingsystemets behov og ikke efter et bestemt API: opret og opdatér kunde, opret tilbud, opret faktura, hent betalingsstatus, hent PDF. e-conomic, Dinero eller et andet system kan så sættes ind senere, uden at resten af systemet ændres.
- **I projektet kører grænsefladen mod et simuleret regnskabssystem.** Det skal opføre sig realistisk:
  - tildeler kundenumre, tilbudsnumre og fakturanumre
  - har statusser — kladde, sendt, bogført, betalt — og kan lave en PDF
  - gemmer sin tilstand adskilt fra bookingerne; bookingsystemet ser den kun gennem grænsefladen
  - har en måde at **registrere en betaling** på, så hele forløbet kan demonstreres, fra tilbud til fuld betaling
  - **efterligner de rigtige begrænsninger** i e-conomic (se nedenfor), så et skift til det rigtige system ikke kommer bag på nogen
- **Brugerfladen skal tydeligt vise, at regnskabet er simuleret.** Et lille mærke er nok. Ingen må kunne tro, at systemet kører mod kundens rigtige regnskab.

Det, systemet skal kunne gennem grænsefladen:

- **Opret og opdatér kunden** ud fra bookingen, så den ikke tastes ind igen.
- **Opret tilbuddet** ud fra de valgte varegrupper, så parret ser det samlede beløb.
- **Generér aftalebekræftelsen** automatisk ud fra en skabelon og bookingens data — ingen genindtastning af navn, adresse og aftalt indhold. Johan skal stadig kunne slette og præcisere i den, før den sendes.
- **Hent fakturastatus** i stedet for skærmbilleder fra netbanken.
- **Understøt betalingsplanen** — reservationsgebyr, 33 %-rate, restbetaling — og **både gamle og nye betingelser**.

### Trello

- Der er allerede **bookinger frem til 2027 i Trello**, og de må ikke gå tabt eller skulle tastes ind igen.
- Johan vil helst blive i Trello, *"hvis ikke det er meget upraktisk"*. **Besluttet: Trello bliver og synkroniseres.** Efter engangsimporten vises boardet inde i systemet, så ingen skal skifte til Trello:
  - **Boardet som kanban i systemet** — lister, kort, labels og tjeklister, som man ser dem i Trello. Hentet gennem Trellos API.
  - **Opgaver oprettes i systemet og lander i Trello** — og omvendt. Et kort flyttet, et punkt afkrydset eller en opgave oprettet det ene sted står også det andet sted.
  - **Altid i sync.** Trello giver besked om ændringer, og en periodisk afstemning fanger dem, der går tabt.

### Kommunikation

- **Bibliotek af tekstbidder** til de faste mails: svar på forespørgsel med grundpakke, mødebekræftelse til fremvisning (med Bryan på CC og hans nummer), tilbudstekst, opfølgning.
- Johan skal **altid kunne tilføje en personlig sætning før afsendelse**. Brudepar er følelsesmæssigt involverede og bruger ofte det største beløb i deres liv; kommunikationen må ikke blive kold.
- **Intet må sendes automatisk uden gennemsyn.** Johans egen bekymring: *"Jeg er bare så nervøs for det der med, hvis jeg ikke selv ved, hvad der er blevet svaret til hvem hvornår."*

---

## AI: resumé af en sag

Et klart afgrænset stykke, der skal kunne vises for sig selv.

- **Problemet:** en sag ligger stille i måneder, og så ringer parret. Johan — eller en kollega, der aldrig har haft sagen — skal hurtigt vide, hvor man står.
- **Input:** bookingens egne data (dato, gæsteantal, pakker, betalingsstatus) plus fritekst — mailtråde og notater.
- **Output:** et kort, struktureret resumé: **status**, **aftalt indhold**, **åbne punkter** (fx *"morgenmad — afventer svar"*), og **sidste kontakt** (dato og hvad der blev sagt, fx *"vil vende tilbage efter nytår"*).
- **Brug:** genoptage en kold sag, sætte en kollega ind i den, forberede et opfølgningsopkald, og som overlevering fra salg til afvikling.

**Grænser, Johan selv har sat:**

- AI'en må **foreslå, aldrig handle**. Den må ikke sende noget.
- Johan har overvejet at lade en AI trække oplysninger ud af mails og lægge dem direkte ind — og afvist det: *"Det ville nok være svært, fordi det aldrig står på den samme måde. Det vil være alt for farligt."* Hvis systemet udtrækker noget fra en mail, skal det **vises som et forslag, han godkender**, ikke gemmes af sig selv.

Allergioplysninger er helbredsoplysninger. Test og demo skal ske på anonymiserede eller opdigtede data.

---

## Kendte tekniske begrænsninger

Undersøgt på forhånd. Den simulerede regnskabsintegration skal efterligne dem, så designet holder, når det rigtige system kommer på.

- **e-conomics API kan ikke sende tilbud på mail.** Kun fakturaer kan sendes via API'et, og kun i det øjeblik de bogføres. I dag sender Johan tilbud fra e-conomics egen brugerflade. Systemet skal enten lade afsendelsen blive der, eller selv stå for den.
- **e-conomic har ingen underskriftsfunktion.** Underskriften foregår i dag på en PDF, der sendes retur.
- **e-conomic tillader kun PDF som bilag**, og kun mens tilbuddet eller fakturaen er en kladde. Når en faktura er bogført, kan der ikke hæftes noget på.
- **e-conomic har ingen webhooks.** Betalingsstatus skal hentes, ikke skubbes.
- **Trello:** strukturerede felter (fx gæsteantal på et kort) kræver en betalt Trello-plan. Tovejs-synkronisering er mulig, men Trellos notifikationer kan tabes og skal suppleres med periodisk afstemning.

---

## Ikke i scope

Det blev også drøftet på mødet, men hører ikke til dette projekt:

- **Overnatning og sommerhusudlejning** — også når brudepar booker husene til deres gæster.
- **Julemarkedet** og administrationen af de ca. 110 stadeholdere.
- **Konferencer og erhvervsarrangementer.**
- **Hjemmesiden** og dens oversættelser. Bestillingsformularerne hører til bookingsystemet; hjemmesiden linker bare til dem.
- **Køreplanen** Bryan laver med toastmasteren ugen før brylluppet.
- Jagt, pop-up-restauranten, lager- og indkøbsstyring.
- **Integration mod det rigtige e-conomic eller Dinero.** Grænsefladen skal være klar til det, men den rigtige forbindelse bygges ikke i denne omgang.

---

## Åbne spørgsmål

Disse er ikke afklaret på mødet. Spørg mig, før du bygger noget, der afhænger af dem.

1. **Hvordan hænger reservationsgebyret og 33 %-raten sammen?** Johan siger, at de 25.000 kr. modregnes *"i den endelige faktura"*. Betyder det, at 33 %-raten beregnes af den fulde pris, og at gebyret først trækkes fra i restbetalingen? Eller trækkes det fra i 33 %-raten?
2. **Hvilken rækkefølge gælder:** skal parret skrive under før eller efter, de betaler reservationsgebyret — eller er begge to krav, uanset rækkefølge, før datoen er sikret?
3. **Hvilke eksisterende bookinger er på gamle, og hvilke på nye betingelser?**
4. ~~**Trello:** blive ved siden af, synkroniseres, eller migreres og udfases?~~ **Besvaret:** Trello synkroniseres, og boardet vises i systemet (se *Trello* ovenfor).
5. **Hvem sender tilbuddet:** regnskabssystemet som i dag, eller bookingsystemet?
6. **Underskrift:** fortsat PDF retur på mail, eller et digitalt underskriftsværktøj?

---

## Teknologi

Allerede besluttet:

- **Frontend:** React med TypeScript, Vite og Tailwind.
- **Backend:** ASP.NET Core Web API (.NET 10).
- **Database og login:** Supabase — Postgres og auth.
- **Hosting:** Azure — Static Web Apps til frontenden, App Service til API'et.
- **Kode og pipelines:** Azure DevOps.
- **Regnskab:** bag en grænseflade, med en simuleret implementering i projektet.

---

## Sådan vil jeg have dig til at arbejde

**Fase 1 — plan (vent på mit "go", før du koder):**

- Stil mig spørgsmålene under *Åbne spørgsmål* og alle andre, du støder på. Gæt ikke på forretningsregler.
- Beskriv datamodellen: booking, kunde, betalingsplan, pakker og varegrupper, klargøring, brugere og roller.
- Beskriv grænsefladen mod regnskabssystemet, den simulerede implementering, og hvordan de tekniske begrænsninger ovenfor efterlignes.
- Beskriv integrationen med Trello.
- List dine antagelser.

**Fase 2 — kørende prototype:**

- **Løs dobbeltindtastningen og gæsteantallet først.** Det er den største smerte.
- Byg det simulerede regnskab tidligt, så hele forløbet fra tilbud til fuld betaling kan vises.
- Brug test- eller mock-adgang til Trello, men byg integrationen, så den er klar til rigtige nøgler.
- **AI-resuméet** bygges som et selvstændigt stykke, der kan vises uden resten af systemet.
