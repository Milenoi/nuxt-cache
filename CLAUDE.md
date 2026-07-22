# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

Nuxt 4 demo application that showcases **multi-layer caching**. It fetches data
from the **NASA APOD API** (Astronomy Picture of the Day), validates and
normalizes it on the server, and caches the results in **Redis**. On the client,
TanStack Vue Query adds a second caching layer. The UI is a custom, dark-only
editorial design built with **shadcn-vue + Tailwind v4**.

Live demo: https://nuxt-cache-project.netlify.app/ (hosted on Netlify with SSR).

## Tech stack

- **Nuxt 4** (SSR enabled), Vue 3.5 `<script setup lang="ts">`, TypeScript in
  strict mode (extra `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch` via `nuxt.config.ts`).
- **shadcn-vue** (New York style, `Ui` prefix, components under
  `app/components/ui/`) on **Tailwind CSS v4** (`@tailwindcss/vite`). Dark-only;
  design tokens live in `app/assets/css/tailwind.css` (`@theme inline`).
- **lucide-vue-next** for icons; SVG brand marks in `public/svg/marks/`.
- **vue-sonner** for toasts (styled globally in `tailwind.css`).
- **@nuxt/fonts** self-hosts **Schibsted Grotesk** (sans) and **Newsreader**
  (serif).
- **TanStack Vue Query** — client-side query cache, wired up by a first-party
  plugin (`app/plugins/vue-query.ts`) with SSR dehydrate/hydrate.
- **Redis** as a Nitro storage driver — server-side response cache (24h TTL).
- **@nuxt/image** — image optimization (IPX in dev, Netlify provider in prod).
- **Zod** — validates the raw NASA response at the server boundary.
- **Yarn 4** (Berry) as package manager — do NOT use npm. Node 24 (`.nvmrc`).

## Commands

Use **yarn**, not npm. Run `nvm use` first (Node 24 pinned in `.nvmrc`).

- `yarn dev` — start dev server (http://localhost:3000)
- `yarn build` — production build
- `yarn generate` — static generation
- `yarn preview` — preview production build
- `yarn lint` — ESLint with autofix (`eslint . --fix`)
- `yarn typecheck` — `nuxt typecheck` (vue-tsc, strict)

Husky + lint-staged run ESLint on staged files pre-commit. Typechecking runs in
CI (`.github/workflows/ci.yml`: lint -> typecheck -> build), not on commit.

## Architecture

The project uses the **Nuxt 4 `app/` directory structure**: all application
code lives under `app/` (`components/`, `composables/`, `layouts/`, `pages/`,
`plugins/`, `utils/`, `lib/`, `assets/`, plus `app.vue`, `error.vue`,
`app.config.ts`). `server/`, `public/`, `shared/` and `test/` stay at the root.
Because of this, the `~`/`@` alias resolves to `app/` (not the project root):

- Types shared by the app **and** the server live in `shared/types/` and are
  imported via `#shared/types` (not `~/types`).
- Server-internal imports use `#server/...` (e.g. `#server/utils/helpers`).

### Server API (`server/api/`)

The caching logic lives here.

- `apod.get.ts` — the main endpoint. Without a query it returns the **list**
  (last 60 days, ending yesterday, keyed `apod:list:<start>_<end>`); with
  `?date=YYYY-MM-DD` it returns a single **detail** entry (keyed
  `apod:detail:<date>`). Flow:
  1. Look up `useStorage("redis").getItem(cacheKey)` — return early on cache hit.
  2. On miss: fetch from NASA (`fetchFromNasa` validates the response with Zod,
     translates upstream failures into clean HTTP errors, and never caches a
     failed response).
  3. Normalize, then `setItem(..., { ttl: 86400 })` (24h). The list step also
     pre-caches every entry under its `apod:detail:<date>` key, so opening any
     detail page is a cache hit instead of another NASA request.
  Cached payloads carry a `redis: "true"` flag; the UI uses it to show whether
  data came fresh from NASA or from the Redis cache (the cache-source badges).
- `clear-redis-cache.post.ts` — POST-only (can't be triggered by a GET prefetch
  or crawler); wipes only this app's `apod:` namespace, never the whole Redis
  instance. Used by the cache footer's "Redis" button.

### Server utils (`server/utils/`)

- `getApodApi.ts` — builds the APOD URL (`date` for detail, `start_date`/
  `end_date` for the list, `thumbs=true` for video thumbnails).
- `apodSchema.ts` — Zod schemas for the raw NASA response; the raw TS type is
  inferred from the schema so it can't drift from what is validated.
- `helpers.ts` — `getFormatDate` (e.g. "Jul 1, 2026").

### Client (`app/composables/`, `app/pages/`, `app/components/`, `app/utils/`)

- `app/composables/useFetchApod.ts` wraps `useQuery` and hits the internal
  `/api/apod` route (never NASA directly). It `await suspense()`s so data is
  ready for SSR. Generic over the return shape: `useFetchApod<ApodList>()` vs
  `useFetchApod<ApodEntry>(date)`. Query key is `["apod"]` for the list and
  `["apod", date]` for a detail. On the client it persists to `localStorage`
  via the query persister. It also writes three shared `useState` values that
  drive the badges/footer: `last-fetch-ms`, `last-fetch-source`, and
  `redis-cleared`, plus exposes `serverSource` ("redis"/"nasa") and
  `fromClientCache`.
- `app/composables/useClearRedisCache.ts` calls the POST clear-cache endpoint.
- `app/utils/getApodEmbed.ts` classifies a video URL (youtube / vimeo / file /
  external) so the detail page picks the right player.
- `app/utils/getImageConfig.ts` — the dev/prod `@nuxt/image` switch and the remote
  domain allowlist.

Pages:

- `app/pages/index.vue` — full-bleed hero (latest APOD image, ambient slow-zoom);
  the whole stage links to the gallery. Shows both cache pills.
- `app/pages/apod/index.vue` — the gallery: media-type filter (all/image/video)
  synced to the URL as `?type=`, loading skeletons, and cards.
- `app/pages/apod/[id].vue` — detail, keyed by the date slug; 2-column layout on
  `lg` (media + narrow description). Renders image, `<video>`, or an embed
  iframe depending on media type (via `getApodEmbed`).
- `app/pages/how.vue` — the caching architecture as a vertical timeline plus a
  "try it yourself" usage guide.
- `app/pages/about.vue` — short project blurb and a tech-stack table.
- `app/error.vue` — shared error page.

Components:

- `app/components/Apod/Card.vue` — a gallery card (image / video poster, video
  overlays, both-cache badge, title/date/copyright).
- `app/components/Apod/CacheBadge.vue` — the both-caches badge (Vue Query mark +
  live server mark: Redis, or NASA once cleared).
- `app/components/Layout/SiteHeader.vue` — fixed, blurred-gradient header; desktop
  nav + an animated "orbit" hamburger with a mobile dropdown.
- `app/components/Layout/CacheFooter.vue` — fixed bar: live cache status + "Vue
  Query: invalidate" and "Redis: clear" buttons, with toasts.
- `app/components/Layout/LoadingLayer.vue` — full-screen orbital-spinner overlay
  shown while any query is fetching.
- `app/components/Layout/ScrollToTop.vue` — appears past 400px scroll (not on `/`).
- `app/components/ui/*` — generated shadcn-vue primitives (button, card, tabs,
  tooltip, skeleton, alert-dialog, sonner, etc.).

Layout & app shell:

- `app/layouts/default.vue` wires the header, the global fetching loader
  (`LoadingLayer`), the page `<slot/>`, the cache footer, scroll-to-top, and the
  sonner `Toaster`, all inside a `TooltipProvider`.
- The page frame is capped by Tailwind's `container` (max 1536) inside a 1920
  wrapper; `body` is black so the area outside the frame reads as gutters.
- `app/app.vue` sets global SEO/OG defaults, favicons/manifest, and lazily loads the
  Vue Query Devtools in dev only.
- All static UI copy is centralized in `app/assets/json/static-text.json`.

### Types

Shared TypeScript interfaces are in `shared/types/index.ts` (imported via
`#shared/types`): `ApodEntry`, `ApodList`, `ApodSource`, `ApodMediaType`,
`ApodEmbed`, etc.

## Configuration & environment

Runtime config is in `nuxt.config.ts`. Secrets come from a `.env` file
(git-ignored) and live in server-only `runtimeConfig`, never `runtimeConfig.public`:

- `NUXT_NASA_API_KEY`
- `NUXT_REDIS_HOST`, `NUXT_REDIS_PORT`, `NUXT_REDIS_USERNAME`, `NUXT_REDIS_PASSWORD`

Redis is configured as a Nitro storage driver under `nitro.storage.redis`.
Vue Query defaults (in `app/plugins/vue-query.ts`): 24h `staleTime`, no refetch on
mount/focus, 2 retries. Remote image domains are allowlisted in
`app/utils/getImageConfig.ts` (dev) and `netlify.toml` (prod): `apod.nasa.gov`,
`img.youtube.com`, `i.ytimg.com`. `routeRules` give `/`, `/about`, `/how` a
CDN cache-control header; APOD routes stay SSR so the cache indicator is live.

## Conventions

- Vue components use `<script setup lang="ts">`.
- Never commit secrets; keep them in `.env`.
- Comments and commit messages in English; no emojis in code or commits.
- New UI primitives come from shadcn-vue (New York style); style with Tailwind
  utilities and the design tokens in `app/assets/css/tailwind.css`.
- Public asset caching and gzip/brotli compression are configured in Nitro.
