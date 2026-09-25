# WeddingBooking — frontend

React-frontenden til bryllupsbookingen på Engestofte Gods. API'et ligger i søsterrepoet `WeddingBooking-Backend`.

**Før du designer eller bygger en feature, læs [`readyprompt.md`](./readyprompt.md)** — arkitektur, datamodel og faserne med deres færdig-kriterier. Kravene og forretningsreglerne står i [`projekt-prompt.md`](./projekt-prompt.md).

## Regler, der er lette at bryde

- **Vis totaler, betalingsplan og status præcis som API'et leverer dem.** Frontenden har ingen prisregler af sin egen — to implementeringer af samme regel giver to svar.
- **Tal med API'et gennem `lib/apiClient`.** Supabase bruges til login og intet andet.
- **Brug typerne genereret fra API'ets OpenAPI-beskrivelse**, så et omdøbt felt fejler ved build og ikke i browseren.
- **Design til 375 px først.** Personalet bruger systemet fra telefonen under opstilling og afvikling.
- **Brugerfladen er på dansk, koden på engelsk.** Oversættelsen af domænebegreberne står i `readyprompt.md` §7.
- **"Du har ikke adgang" vises kun ved 403.** Alle andre fejl siger, at serveren ikke svarer, og viser statuskoden.

## Deployment

- `VITE_`-variabler bages ind ved build. API'ets adresse er pipeline-variablen `apiBaseUrl`; at rette den i Azure-portalen bagefter ændrer intet.
- `public/staticwebapp.config.json` undtager `/api/*` fra `navigationFallback`. Uden det svarer Static Web Apps på API-kald med `index.html` og status 200.
- Hovedbranchen hedder `main` med lille m. Én feature-branch pr. fase, med samme navn som i backend-repoet.
