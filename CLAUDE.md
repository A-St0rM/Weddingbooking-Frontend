# WeddingBooking — frontend

React + TypeScript frontend for the wedding booking system, and the home of the project's domain documentation.

The ASP.NET Core API lives in the sibling repo `WeddingBooking-Backend`.

## Read these first

- [CONTEXT.md](./CONTEXT.md) — the glossary. Use its terms; don't drift to the synonyms listed under _Avoid_.
- [ARCHITECTURE.md](./ARCHITECTURE.md) — data model, system shape, build order.
- [docs/adr/](./docs/adr/) — the decisions and why. Say so explicitly if your work contradicts one.

## Getting started

```bash
cp .env.example .env.local   # fill in the Supabase values
npm install
npm run dev
```

`npm run typecheck`, `npm run lint`, `npm run build`.

## Layout

```
src/
├── app/           router, providers, layout — wiring, no features
├── features/      one folder per domain area: booking, kunde, pakke, klargoering, auth
│   └── <area>/    api/ · components/ · hooks/ · types.ts
├── components/ui/ shared presentational components, no domain knowledge
├── lib/           apiClient, supabase, formatting
├── hooks/         cross-feature hooks
└── styles/
```

A feature owns its own API calls, components and hooks. Reaching into another feature's folder is a smell — lift the shared thing into `lib/` or `components/ui/` instead.

## Rules that are easy to break by accident

- **Never query Supabase from the browser.** `lib/supabase.ts` is for login only; every read and write goes through `lib/apiClient.ts` to the API — ADR-0002.
- **Never compute money or status in the frontend.** Line totals, booking totals and the displayed status come from the API already calculated. Recomputing them here creates a second answer that will eventually disagree — ADR-0005.
- **Domain terms keep their Danish spelling in code** (`gæsteantal`, `Salgsstatus`), but **paths are ASCII-folded** (`klargoering/`) — ADR-0001.
- **The UI is in Danish.** Code and comments are in English.
- **Mobile matters.** Five staff use this from phones while setting tables. Every view works at 375px wide.

## Deployment

The frontend is served from Azure Static Web Apps. The whole deployment — both repos — is one script, in the backend repo:

```bash
cd ../WeddingBooking-Backend && ./infra/deploy.sh
```

It builds this app with `VITE_API_BASE_URL` pointed at the API's real Azure hostname, which it reads out of the deployment rather than having anyone type it. `public/staticwebapp.config.json` makes Static Web Apps serve `index.html` for client-side routes; without it every URL except `/` is a 404 on refresh.

## What belongs here, and what belongs in the backend

Full table in [ARCHITECTURE.md](./ARCHITECTURE.md#what-belongs-where). The short version:

This repo renders what the API gives it and **calculates nothing of consequence** — no totals, no status, no authorisation. Pricing, status derivation, access control, the database and every external integration live in `WeddingBooking-Backend`.

The test for anything disputed: if getting it wrong would produce a wrong number or leak data, it belongs in the backend.

This repo also holds the **shared documentation for both repos** — glossary, ADRs, specs and tickets. The backend reads them from here and keeps no copies.

A change that needs both repos is still **one ticket**, with a `Repos:` line naming both.

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
