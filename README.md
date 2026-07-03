# Nuxt Cache Project

A **Nuxt 4** demo that shows how to make a slow third-party API feel instant by
layering caches around it. It fetches NASA's **Astronomy Picture of the Day
(APOD)**, normalizes it on the server, and serves it through **Redis** (server
cache) and **TanStack Vue Query** (client cache), with **Netlify's Image CDN**
handling image delivery.

🔗 **Live:** https://nuxt-cache-project.netlify.app/

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Nuxt 4 (SSR) · Vue 3.5 |
| Language | TypeScript 6 (strict) |
| UI | Vuetify 4 (Material Design 3, dark theme) · MDI **SVG** icons (`@mdi/js`) |
| Server cache | Redis (via Nitro `unstorage` driver) |
| Client cache | TanStack Vue Query (+ `localStorage` persister) |
| Validation | Zod (validates the NASA response at the boundary) |
| Images | `@nuxt/image` — IPX (dev) / Netlify Image CDN (prod) |
| Runtime | Node 24 · Yarn 4 |
| Quality | ESLint 10 (flat config) · `nuxt typecheck` · GitHub Actions CI |

---

## How it works

### Data flow

```
Browser ──▶ /api/apod (Nuxt server route)
                │  1. look up Redis
                │  2. hit  → return cached JSON (flagged redis:true)
                │     miss → fetch NASA, validate (Zod), normalize, cache 24h
                ▼
            NASA APOD API
```

The browser **never** talks to NASA directly, so the API key stays server-side.

### The three cache layers

Each layer caches a **different** thing — this is the core lesson of the project:

1. **Redis (server):** the normalized APOD **JSON** (titles, dates, image URLs).
   TTL 24h. On a cache hit the payload carries a `redis: "true"` flag, which the
   UI uses to show a Redis vs. NASA badge on each card.
2. **TanStack Vue Query (client):** the same **JSON**, kept in memory and
   persisted to `localStorage`, so repeat visits render instantly without
   re-fetching. `/` and `/apod` share the same query key, so navigating between
   them reuses one cache.
3. **Browser HTTP cache + Netlify Image CDN:** the actual **image files**.
   TanStack never stores image binaries — that is what makes the "slow first
   load, instant second load" behaviour of images a *separate* layer.

> Note: the APOD list key includes the date range ("last 32 days, ending
> yesterday"), so it rotates once per calendar day — the first request each day
> is a miss (one rebuild), then fast for the rest of the day.

### Image pipeline (dev vs. deployed)

Images are optimized responsively with `@nuxt/image`:

- **Development (`yarn dev`):** the built-in **IPX** optimizer, because
  Netlify's `/​.netlify/images` endpoint doesn't exist locally.
- **Production (Netlify):** the **Netlify Image CDN** (`provider: "netlify"`),
  which generates AVIF/WebP variants on the fly at the edge — no serverless IPX
  round-trip.

The dev/prod switch lives in `utils/getImageConfig.ts`. Remote image domains
(`apod.nasa.gov`, YouTube thumbnails) are allowlisted in **both** the Nuxt image
config **and** `netlify.toml` (`remote_images`).

Aspect ratios are deliberate: the hero and list thumbnails use a fixed **16:9**
crop (`object-fit: cover`), while the detail page shows the **full image at its
native ratio** (uncropped).

### Cache headers

Static pages (`/`, `/about`) send `Cache-Control: public, s-maxage=3600,
stale-while-revalidate=86400` via `routeRules`, so Netlify's CDN serves them
instantly and revalidates in the background. `/apod` stays SSR so its Redis/NASA
indicator is always live.

---

## Getting started

### Prerequisites

- **Node 24** (`.nvmrc`) — run `nvm use` (or `nvm install`)
- **Yarn 4** (bundled via `packageManager`, enable with `corepack enable`)

### Installation

```bash
git clone git@github.com:Milenoi/nuxt-cache.git
cd nuxt-cache
nvm use          # switch to Node 24
yarn install
```

### Environment variables

Create a `.env` in the project root:

```bash
NUXT_NASA_API_KEY=YOUR_NASA_API_KEY        # https://api.nasa.gov/
NUXT_REDIS_HOST=YOUR_REDIS_HOST            # https://redis.io/try-free/
NUXT_REDIS_PORT=YOUR_REDIS_PORT
NUXT_REDIS_USERNAME=YOUR_REDIS_USERNAME    # usually "default"
NUXT_REDIS_PASSWORD=YOUR_REDIS_PASSWORD
```

`.env` is git-ignored. Secrets live in server-only `runtimeConfig`, never under
`runtimeConfig.public`, so they are never shipped to the browser.

### Development

```bash
yarn dev         # http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `yarn dev` | Start the dev server |
| `yarn build` | Production build |
| `yarn preview` | Preview the production build locally |
| `yarn lint` | ESLint (`eslint . --fix`) |
| `yarn typecheck` | `nuxt typecheck` (vue-tsc, strict) |

ESLint + Stylelint-free formatting runs on staged files via a Husky pre-commit
hook (lint-staged). Typechecking runs in CI, not on commit (it's project-wide).

## Deployment

The site auto-deploys to **Netlify** on every push to `main` (Nuxt is
auto-detected → SSR via serverless functions). To deploy your own copy:

1. Connect the repo to Netlify.
2. Set the environment variables (from `.env`) in **Site settings → Environment
   variables** — plus `NODE_VERSION=24` (Nuxt 4 needs Node 20+).
3. Push to `main`.

## Continuous integration

`.github/workflows/ci.yml` runs on every push / PR: **lint → typecheck → build**.

---

## Changelog — modernization

This project was migrated from an aging Nuxt 3 stack to a current one:

**Framework & tooling**
- Nuxt 3 → **Nuxt 4**, Vue 3.4 → **3.5** (fixed 26 npm security advisories)
- Node 18 (EOL) → **Node 24**; added an `engines` field
- Vuetify 3 → **Vuetify 4** (re-exposed the removed MD color utility classes as
  theme colors; fixed the SSR→hydration layout jump)
- TypeScript 5 → **6** with stricter options (`noUncheckedIndexedAccess`, …) and
  a `no-explicit-any` lint rule; the whole project now passes `nuxt typecheck`
- ESLint 9 → **10** (flat config); removed dead ESLint deps and legacy `.eslintrc`
- Replaced the unmaintained `@hebilicious/vue-query-nuxt` wrapper with a small
  first-party Vue Query plugin
- Fixed the Husky 9 `prepare` script; removed Stylelint (little value for this
  Vuetify-heavy app)

**Content & data**
- Removed the discontinued Marvel and NASA Mars Rover integrations; the app now
  centers on **NASA APOD**
- Added **Zod** validation of the NASA response so the types can't drift from
  reality
- The overview hero now pulls the **latest APOD image dynamically** (through the
  same Redis + TanStack cache), instead of shipping a static image

**Security & delivery**
- Marvel API moved from `http` → `https`; removed credential logging
- Hardened the cache-clear endpoint: `GET` (unauthenticated, wiped the whole DB)
  → **`POST`, scoped to the `apod:` namespace**
- `@nuxt/image-edge` → stable `@nuxt/image`; MDI icon **font → SVG icons**
  (dropped a large render-blocking web font)
- Added CDN cache headers, lazy-loaded list images, NASA favicons, Open Graph /
  Twitter Card meta, and mobile layout polish

---

## Contribution

Feel free to open a pull request. Please follow the project's code of conduct.

## License

MIT — see the [LICENSE](LICENSE) file.
