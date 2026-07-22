// Build-time syntax highlighting for the "How it works" code samples.
//
// Curated, faithful excerpts of the real cache-chain code (one per layer) are
// highlighted with Shiki here and written to app/assets/json/code-snippets.json as
// ready-made HTML. The page renders that HTML directly, so Shiki never ships to
// the client and there is no SSR cost. Re-run with `yarn snippets` whenever the
// source excerpts below change (this also runs automatically before a build).

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { codeToHtml } from "shiki";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(__dirname, "../app/assets/json/code-snippets.json");
const THEME = "vitesse-dark";

// Order matches `how.steps` in static-text.json: Vue Query -> Nitro -> Redis -> NASA.
const snippets = [
  {
    key: "vue-query",
    file: "plugins/vue-query.ts",
    code: `// The client cache: TanStack Vue Query, SSR-safe.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 24 * 60 * 60 * 1000, // 24h — a repeat view never refetches
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// The server dehydrates the cache into the Nuxt payload; the client hydrates
// from it — so there is no duplicate fetch right after hydration.
if (import.meta.server) {
  nuxt.hooks.hook("app:rendered", () => {
    vueQueryState.value = dehydrate(queryClient);
  });
}
if (import.meta.client) hydrate(queryClient, vueQueryState.value);`,
  },
  {
    key: "nitro",
    file: "server/api/apod.get.ts",
    code: `// The Nitro layer wraps Redis in an in-process, stale-while-revalidate cache.
const throughNitro = defineCachedFunction(throughRedis, {
  name: "apod-detail",
  group: "apod-nitro",
  getKey: (d: string) => d,
  maxAge: 30,          // fresh for 30s — answers directly
  staleMaxAge: 86400,  // then serves the stale value instantly...
  swr: true,           // ...and refreshes in the background, no request waits
});

// A warm hit never leaves the server process, beating the Redis network hop.
const entry = await throughNitro(date);`,
  },
  {
    key: "redis",
    file: "server/api/apod.get.ts",
    code: `// Redis: the persistent, shared cache-aside store (24h TTL). Nitro falls
// through to here on a miss.
const throughRedis = async (d: string): Promise<ApodEntry> => {
  const storage = useStorage("redis");
  const cacheKey = \`apod:detail:\${d}\`;

  const cached = await storage.getItem<ApodEntry>(cacheKey);
  if (cached) {
    servedBy = "redis";
    return cached; // hit: shared by every visitor, no NASA call
  }

  servedBy = "nasa"; // miss: fall through to the origin...
  const entry = await fetchDetail(d);
  await storage.setItem(cacheKey, entry, { ttl: 86400 }); // ...then backfill
  return entry;
};`,
  },
  {
    key: "nasa",
    file: "server/api/apod.get.ts",
    code: `// The origin: NASA's APOD API — rate-limited and slow, so it is the last
// resort. The response is validated before anything downstream trusts it.
const fetchFromNasa = async <T>(url: string, schema: ZodType<T>): Promise<T> => {
  try {
    // Zod validates the upstream shape; a mismatch throws instead of
    // silently caching bad data.
    return schema.parse(await $fetch(url));
  } catch (error) {
    const status = (error as { status?: number }).status ?? 502;
    // A failed response is never cached, so a transient outage can't poison
    // the cache.
    throw createError({ statusCode: status, statusMessage: "…" });
  }
};`,
  },
];

const highlight = async (code) => {
  const html = await codeToHtml(code, { lang: "ts", theme: THEME });
  // Drop Shiki's inline background so the surrounding panel controls it.
  return html.replace(/background-color:[^;"]+;?/, "");
};

const out = await Promise.all(
  snippets.map(async ({ key, file, code }) => ({
    key,
    file,
    html: await highlight(code),
  })),
);

await mkdir(dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`Wrote ${out.length} highlighted snippets to ${OUT_FILE}`);
