# Nuxt Cache Project

A **Nuxt 4** demo that shows how to make a slow, rate-limited third-party API
feel instant by layering caches around it. It fetches NASA's **Astronomy Picture
of the Day (APOD)**, validates and normalizes it on the server, and serves it
through **Redis** (server cache) and **TanStack Vue Query** (client cache), with
**Netlify's Image CDN** handling image delivery. The UI is a custom, dark-only
editorial design built on **shadcn-vue + Tailwind v4**.

**Live:** https://nuxt-cache-project.netlify.app/

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Nuxt 4 (SSR) · Vue 3.5 (`<script setup>`) |
| Language | TypeScript (strict) |
| UI | shadcn-vue (New York, dark-only) · Tailwind CSS v4 · lucide-vue-next icons · vue-sonner toasts |
| Fonts | @nuxt/fonts (self-hosted Schibsted Grotesk + Newsreader) |
| Server cache | Redis (via Nitro `unstorage` driver, 24h TTL) |
| Client cache | TanStack Vue Query (+ `localStorage` persister) |
| Validation | Zod (validates the NASA response at the boundary) |
| Images | `@nuxt/image` — IPX (dev) / Netlify Image CDN (prod) |
| Runtime | Node 24 · Yarn 4 |
| Quality | ESLint (flat config) · `nuxt typecheck` · GitHub Actions CI |

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
   TTL 24h, shared by every visitor. On a cache hit the payload carries a
   `redis: "true"` flag, which the UI uses to show a Redis vs. NASA badge.
2. **TanStack Vue Query (client):** the same **JSON**, kept in memory and
   persisted to `localStorage`, so repeat visits render instantly without
   re-fetching. The server dehydrates the cache into the Nuxt payload and the
   client hydrates from it, so there is no duplicate fetch after hydration.
3. **Browser HTTP cache + Netlify Image CDN:** the actual **image files**.
   Vue Query never stores image binaries — that is what makes the "slow first
   load, instant second load" behaviour of images a *separate* layer.

> Note: the APOD list key includes the date range ("last 60 days, ending
> yesterday"), so it rotates once per calendar day — the first request each day
> is a miss (one rebuild), then fast for the rest of the day. Loading the list
> also pre-caches each day under its own `apod:detail:<date>` key, so opening any
> detail page is a Redis hit rather than a fresh NASA request.

### Watch the caches at work

- **Cache-source badges** — the hero and every gallery card show which layer
  served the data: the Vue Query mark (client cache) next to the Redis mark
  (server cache), or the NASA meatball for a fresh fetch.
- **Cache footer** — a fixed bar reports the last real fetch's source and
  timing, and offers two controls: *Vue Query: invalidate* (drop the browser
  copy and refetch) and *Redis: clear* (wipe the server cache, so the next load
  is a genuine cold start). The `/how` page walks through all of this.

### Image pipeline (dev vs. deployed)

Images are optimized responsively with `@nuxt/image`:

- **Development (`yarn dev`):** the built-in **IPX** optimizer, because
  Netlify's `/.netlify/images` endpoint doesn't exist locally.
- **Production (Netlify):** the **Netlify Image CDN** (`provider: "netlify"`),
  which generates AVIF/WebP variants on the fly at the edge.

The dev/prod switch lives in `utils/getImageConfig.ts`. Remote image domains
(`apod.nasa.gov`, YouTube thumbnails) are allowlisted in **both** the Nuxt image
config **and** `netlify.toml` (`remote_images`).

### Cache headers

Static pages (`/`, `/about`, `/how`) send `Cache-Control: public, s-maxage=3600,
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
| `yarn generate` | Static generation |
| `yarn preview` | Preview the production build locally |
| `yarn lint` | ESLint (`eslint . --fix`) |
| `yarn typecheck` | `nuxt typecheck` (vue-tsc, strict) |

ESLint runs on staged files via a Husky pre-commit hook (lint-staged).
Typechecking runs in CI, not on commit (it's project-wide).

## Pages

- **`/`** — full-bleed hero built from the latest APOD, linking to the gallery.
- **`/apod`** — the gallery: last 60 days, filterable by images and videos
  (`?type=`), with loading skeletons and per-card cache badges.
- **`/apod/[date]`** — a single day; image, `<video>`, or embed depending on
  media type, with a two-column layout on large screens.
- **`/how`** — the caching architecture as a timeline plus a usage guide.
- **`/about`** — a short project blurb and the tech-stack table.

## Deployment

The site auto-deploys to **Netlify** on every push to `main` (Nuxt is
auto-detected → SSR via serverless functions). To deploy your own copy:

1. Connect the repo to Netlify.
2. Set the environment variables (from `.env`) in **Site settings → Environment
   variables** — plus `NODE_VERSION=24`.
3. Push to `main`.

## Continuous integration

`.github/workflows/ci.yml` runs on every push / PR: **lint → typecheck → build**.

---

## Contribution

Feel free to open a pull request.

## License

MIT — see the [LICENSE](LICENSE) file.
