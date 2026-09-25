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
