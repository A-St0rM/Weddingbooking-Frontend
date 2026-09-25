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
