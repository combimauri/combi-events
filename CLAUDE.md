# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

CombiEvents is an event-management application: users browse events, register (filling event-specific dynamic forms), pay via a payment gateway or QR, buy products from an event marketplace, and receive a QR ticket. Admins manage their assigned events, validate payments, export registrations to CSV, and scan tickets/workshop sessions on-site.

It is an **Angular 18 SSR** frontend backed by **Firebase** (Auth, Firestore, Storage) with backend business logic in **Firebase Cloud Functions** (`functions/`). Data lives in Firestore; the Angular services read/write it directly, while operations requiring secrets or trust (payment orders, coupon/count increments, sending mail) go through callable Cloud Functions.

## Commands

Run from the repo root unless noted.

```bash
npm start              # ng serve — dev server at http://localhost:4200 (uses environment.development.ts)
npm run build          # prod build; runs keys:override first (writes $KEYS_CONFIG to keys.prod.ts)
npm run build:local    # ng build without the keys:override step (use this locally)
npm run watch          # dev build in watch mode
npm test               # ng test — Karma + Jasmine, all specs
npm run serve:ssr:combi-events   # run the built SSR server from dist/

# Run a single test file: narrow the spec via Karma/Jasmine focus, e.g.
ng test --include='**/events.service.spec.ts'
```

Cloud Functions (run from `functions/`):

```bash
npm run build          # tsc -> lib/
npm run serve          # build + firebase emulators (functions only)
npm run deploy         # firebase deploy --only functions
npm run logs           # firebase functions:log
```

### First-time setup

`npm ci`, then `npm run keys:create` (copies `keys.template.ts` -> `keys.ts`) and paste the real Firebase config into `src/environments/keys.ts`. Without `keys.ts` the app will not build.

## Prerequisites & conventions

- **Node 20** (see `.nvmrc` / functions `engines`). Frontend and functions are separate npm packages with separate `node_modules`.
- **Prettier** runs on commit via **Husky + lint-staged** (`*.{ts,js,scss,html,md}`). There is no ESLint; formatting is the only enforced gate.
- TypeScript is **strict** (`strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `strictTemplates`). Path aliases (frontend `tsconfig.json`): `@env/*`, `@core/*`, `@shared/*`.
- Component defaults (from `angular.json` schematics): **inline template + inline styles**, `OnPush` change detection, SCSS, `combi` selector prefix. Follow this for new components.

## Architecture

### Frontend (`src/app/`)

Standalone components with lazy-loaded routes throughout. Route tree:
`app.routes.ts` → `login/` and `events/`. `events.routes.ts` nests everything under `:eventId` (event-data, `register`, `staff-registration`, `admin`, `scanner`, `marketplace`, `sessions`), each gated by guards and hydrated by resolvers.

- **`core/services/`** — one service per Firestore collection (`events`, `event-records`, `products`, `product-records`, `sessions`, `session-records`, `coupons`, `payments`, `auth`). Services inject `Firestore` and use `@angular/fire` (`collectionData`/`docData`). Callable Cloud Functions are invoked from here for privileged operations.
- **`core/states/`** — lightweight signal-based stores (one class per domain entity, `@Injectable({providedIn:'root'})`). Pattern: a private `signal`, a public `computed` getter, and `set*`/`clear*` methods. `LoadingState` drives the global spinner. This is the app's state management — there is no NgRx.
- **`core/guards/`, `core/resolvers/`** — route access control and pre-fetching. `platformGuard` guards SSR/browser platform; `authGuard`/`loginGuard`/`adminGuard`/`marketplaceGuard`/`registrationGuard` gate features. Barrel-exported via `index.ts`.
- **`core/utils/`** — cross-cutting helpers used pervasively in services:
  - `loadEffect()` returns an rxjs observer (`subscribe`/`finalize`) wired to `LoadingState`; pipe it via `tap(this.#loadEffectObserver)` to toggle the global loader.
  - `handleError(error, logger)` logs and swallows to `of(undefined)`; used in every service's `catchError`.
  - The standard service query pattern is: build query → `pipe(tap(loadEffectObserver), take(1), catchError(handleError))`.
- **`shared/`** — reusable presentational components, directives, pipes (barrel `index.ts`).

Services use ES private fields (`#firestore`, `#logger`) and `inject()` rather than constructor injection — match this style.

### Backend (`functions/src/`)

Cloud Functions v2, `firebase-admin`. `index.ts` exports callables (`onCall`) / HTTP (`onRequest`) that orchestrate `utils/*` modules (mirrors of the domain: `events`, `event-records`, `products`, `coupons`, `orders`, `payments`, `sessions`, `mail`). Models live in `functions/src/models/` and are **duplicated** from the frontend models — keep both in sync when changing shared shapes.

**Payment gateway note:** the current gateway integration is `biyuyo.utils.ts` (`getOrderData`, gateway order/token flow). `wolipay.utils.ts` and the `wolipay-*` models are the older/legacy integration still present in the tree — prefer `biyuyo` for payment work. Gateway credentials come from Cloud Functions secrets (`PAYMENT_GATEWAY_BASE_PATH/EMAIL/PASSWORD`), never from client config.

### Domain concepts

- **Event record** = a user's registration for an event (includes dynamic `additionalAnswers` to the event's `additionalQuestions`). Registration is a multi-step flow (`registration-step.enum.ts` / `RegistrationStepState`).
- **Additional questions** can carry pricing logic: a question keyed `price` with an `optionWithDiscount` controls whether a discount/bundle applies (see `applyDiscount` in `functions/src/index.ts` and recent commits on discount/price questions).
- **Product record** = a marketplace purchase; **session record** = workshop/session registration. Each has its own service, state, resolver, and admin/scanner view.
- CSV export uses `export-to-csv`; QR generation via `angularx-qrcode`; QR scanning via `@zxing/ngx-scanner`.

## Environments, keys & deployment

- `src/environments/` holds `environment.ts` (prod) and `environment.development.ts` (swapped in for the `development` build config). Firebase config is imported from `keys.ts` (git-ignored, generated).
- `npm run build` (prod) runs `keys:override`, writing the `$KEYS_CONFIG` env var into `keys.prod.ts` — this is how CI/hosting injects secrets. Use `build:local` when building by hand.
- **Two deploy targets exist:**
  - **Firebase App Hosting** (`apphosting.yaml`) — SSR on Cloud Run; injects `KEYS_CONFIG` from Secret Manager (`keysConfig`).
  - **Vercel** (`vercel.json`) — rewrites all routes to `/api`; `api/index.js` imports the built SSR server (`dist/combi-events/server/server.mjs`). Requires a prior build.
- `server.ts` is the Express SSR entry (Angular `CommonEngine`), serving static assets from `dist/.../browser` and rendering everything else through Angular.
- Firebase Functions deploy separately (`firebase.json` → `functions/`, predeploy builds via tsc).
