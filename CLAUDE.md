# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

Nuxt 4 demo application that showcases **multi-layer caching**. It fetches data
from the **NASA APOD API** (Astronomy Picture of the Day), normalizes it on the
server, and caches the results in **Redis**. On the client, TanStack Vue Query
adds a second caching layer. The UI is built with Vuetify 3.

Live demo: https://nuxt-cache-project.netlify.app/ (hosted on Netlify with SSR).

> History: the project originally also integrated the Marvel Comics API and the
> NASA Mars Rover Photos API. Both upstreams became unreliable (Mars Photos was
> discontinued; Marvel had outages), so the app was consolidated onto NASA APOD.

## Tech stack

- **Nuxt 4** (SSR enabled), Vue 3 `<script setup>`, TypeScript
- **Vuetify 3** (Material Design 3 blueprint, dark theme default) + MDI icons
- **TanStack Vue Query** via `@hebilicious/vue-query-nuxt` — client-side query cache
- **Redis** as Nitro storage driver — server-side response cache
- **@nuxt/image** — image optimization (Netlify provider in production)
- **Yarn 4** (Berry) as package manager — do NOT use npm

## Commands

Use **yarn**, not npm. Node version is pinned in `.nvmrc` (`nvm use`).

- `yarn dev` — start dev server (http://localhost:3000)
- `yarn build` — production build
- `yarn generate` — static generation
- `yarn preview` — preview production build
- `yarn lint` — ESLint with autofix (`eslint . --fix`)
- `yarn stylelint` — lint `.vue`/`.scss` files
- `yarn stylelint:fix` — stylelint with autofix

Husky + lint-staged run ESLint and Stylelint on staged files pre-commit
(see `.lintstagedrc`).

## Architecture

### Server API (`server/api/`)

The caching logic lives here.

- `apod.get.ts` — the main endpoint. Without a query it returns the **list**
  (last 14 days, keyed `apod:list:<start>_<end>`); with `?date=YYYY-MM-DD` it
  returns a single **detail** entry (keyed `apod:detail:<date>`). Flow:
  1. Look up `useStorage("redis").getItem(cacheKey)` — return early on cache hit.
  2. On miss: fetch from NASA (`fetchFromNasa` translates upstream failures into
     clean HTTP errors and never caches a failed response).
  3. Normalize, then `setItem(..., { ttl: 86400 })` (24h). The list step also
     pre-caches every entry under its `apod:detail:<date>` key, so opening any
     detail page is a cache hit instead of another NASA request.
  Cached payloads carry a `redis: "true"` flag; the UI uses it to show whether
  data came fresh from NASA or from the Redis cache (the small logo on cards).
- `clear-redis-cache.ts` — deletes all Redis keys (used by the cache action bar).

### Server utils (`server/utils/`)

- `getApodApi.ts` — builds the APOD URL (`date` for detail, `startDate`/`endDate`
  for the list, `thumbs=true` for video thumbnails).
- `helpers.ts` — `getFormatDate`, plus legacy helpers.

### Client (`composables/`, `pages/`, `components/`, `utils/`)

- `composables/useFetchApod.ts` wraps `useQuery` and hits the internal `/api/apod`
  route (never NASA directly). It `await suspense()`s so data is ready for SSR.
  Generic over the return shape: `useFetchApod<ApodList>()` vs
  `useFetchApod<ApodEntry>(date)`.
- `composables/useClearRedisCache.ts` calls the clear-cache endpoint.
- `utils/getApodEmbed.ts` classifies a video URL (youtube / vimeo / file /
  external) so the detail page picks the right player.
- Pages: `pages/apod/index.vue` (list + media-type filter synced to the URL) and
  `pages/apod/[id].vue` (detail, keyed by date; renders image, `<video>`, or an
  embed iframe depending on media type).
- Components: `components/Apod/Thumbnail.vue` (card media incl. video poster),
  `components/Apod/MediaTypeBadge.vue` (video badge), `components/ApiLogo.vue`
  (the NASA/Redis data-source logo).
- Static UI text is centralized in `assets/json/static-text.json`.
- Layout components live in `components/Layout/`; `layouts/default.vue` wires up
  the app bar, footer, cache action bar, and a global fetching loader.

### Types

Shared TypeScript interfaces are in the root `types.d.ts` (imported via `~/types`).

## Configuration & environment

Runtime config is in `nuxt.config.ts`. Secrets come from a `.env` file (git-ignored):

- `NUXT_NASA_API_KEY`
- `NUXT_REDIS_HOST`, `NUXT_REDIS_PORT`, `NUXT_REDIS_USERNAME`, `NUXT_REDIS_PASSWORD`

Redis is configured as a Nitro storage driver under `nitro.storage.redis`.
Vue Query defaults: 24h `staleTime`, no refetch on mount/focus, 2 retries.
Remote image domains are whitelisted in `utils/getImageConfig.ts` (dev) and
`netlify.toml` (prod): `apod.nasa.gov`, `img.youtube.com`, `i.ytimg.com`.

## Conventions

- Vue components use `<script setup lang="ts">`.
- Never commit secrets; keep them in `.env`.
- Comments and commit messages in English; no emojis in code or commits.
- Public asset caching and gzip/brotli compression are configured in Nitro.
