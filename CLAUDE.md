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

## Det visuelle

Kald skill'en, før du skriver koden til det, den dækker:

- **`ui-ux-pro-max`** — når du designer en side, en komponent eller designsystemet: layout, typografi, farver, komponenter, tilgængelighed.
- **`apple-design`** — når en interaktion skal føles fysisk: sheets, swipe, træk, overgange mellem sider, dybde.
- **`animate`** — når noget skal bevæge sig. Den afgør først, om det overhovedet skal animeres, og derefter hvordan.

Systemet er et arbejdsværktøj for fem medarbejdere, der bruger det fra telefonen — ofte stående, med én hånd, i dagslys og under tidspres. Design efter det: roligt, hurtigt, store trykflader og høj kontrast. Det er et værktøj, ikke en markedsføringsside. Bevægelse respekterer `prefers-reduced-motion`.

## Deployment

- `VITE_`-variabler bages ind ved build. API'ets adresse er pipeline-variablen `apiBaseUrl`; at rette den i Azure-portalen bagefter ændrer intet.
- `public/staticwebapp.config.json` undtager `/api/*` fra `navigationFallback`. Uden det svarer Static Web Apps på API-kald med `index.html` og status 200.
- Hovedbranchen hedder `main` med lille m. Én feature-branch pr. fase, med samme navn som i backend-repoet.
