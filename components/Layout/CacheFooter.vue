<script setup lang="ts">
import { useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { footer } from "~/assets/json/static-text.json";
import type { ApodSource } from "~/types";

// Fixed cache-control bar. Replaces the Vuetify CacheActionBar + AppFooter.
// All caching behaviour is preserved 1:1 — only the presentation changed.

// Shared with useFetchApod: flips the badge to "nasa" after Redis is cleared.
const redisCleared = useState("redis-cleared", () => false);
// Duration of the last real fetch (ms), written by useFetchApod.
const lastFetchMs = useState<number | null>("last-fetch-ms", () => null);
// Source of the last real fetch, written by useFetchApod. Correct on any page
// (list or detail) — unlike inspecting a fixed query key here.
const lastFetchSource = useState<ApodSource>("last-fetch-source", () => "nasa");

const queryClient = useQueryClient();

// Fill {placeholders} in a static-text template with runtime values.
const fill = (template: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );

const timing = computed(() =>
  lastFetchMs.value !== null
    ? `${(lastFetchMs.value / 1000).toFixed(2)} s`
    : "",
);
const sourceLabel = computed(() =>
  lastFetchSource.value === "redis" ? "Redis" : "NASA",
);

// Shown right after a manual clear until the next real fetch resolves.
const justCleared = ref(false);
watch(lastFetchMs, () => {
  justCleared.value = false;
});

// Page-agnostic status: reflects the last real fetch (source + timing), which is
// correct on the list AND detail pages.
const status = computed(() => {
  if (justCleared.value) return footer.statusCleared;
  if (lastFetchMs.value === null) return footer.statusReady;
  return fill(footer.statusServed, {
    source: sourceLabel.value,
    timing: timing.value,
  });
});

const invalidateQuery = async () => {
  // Only an ACTIVE apod query actually refetches. On static pages (how/about)
  // there is none, so report an honest "invalidated" instead of a fake refetch.
  const active = queryClient
    .getQueryCache()
    .findAll({ queryKey: ["apod"], type: "active" });
  await queryClient.invalidateQueries();
  if (active.length > 0) {
    toast.success(
      fill(footer.toastRefetched, {
        source: sourceLabel.value,
        timing: timing.value ? ` in ${timing.value}` : "",
      }),
    );
  } else {
    toast.info(footer.toastInvalidated);
  }
};

const clearRedisCache = async () => {
  try {
    const data = await useClearRedisCache();
    if (data.status === 200) {
      // Redis is now empty → flip the badge to "nasa" straight away.
      redisCleared.value = true;
      justCleared.value = true;
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  } catch {
    toast.error(footer.toastRedisFail);
  }
};
</script>

<template>
  <footer
    class="fixed bottom-0 left-1/2 z-[60] w-full max-w-[1920px] -translate-x-1/2 border-t border-white/[0.08] bg-[rgba(7,7,9,0.74)] backdrop-blur-[18px] backdrop-saturate-[1.2]"
  >
    <div
      class="container mx-auto flex h-16 items-center gap-3 px-5 md:px-8"
    >
      <!-- Left: full status on sm+, short "Clear:" label on phones -->
      <span class="text-xs text-text-dim sm:hidden">{{ footer.clearShort }}</span>
      <div class="hidden min-w-0 items-center sm:flex">
        <!-- Live cache state is client-runtime only; SSR shows a stable fallback
             so the layout footer doesn't hydration-mismatch the page's fetch. -->
        <ClientOnly>
          <span class="truncate text-sm text-text-muted" :title="status">
            {{ status }}
          </span>
          <template #fallback>
            <span class="truncate text-sm text-text-muted">
              {{ footer.statusReady }}
            </span>
          </template>
        </ClientOnly>
      </div>

      <!-- Actions: always pushed to the right -->
      <div class="ml-auto flex items-center gap-2 sm:gap-3">
        <span class="hidden text-xs text-text-dim sm:inline">
          {{ footer.clearCache }}
        </span>

        <!-- Vue Query: invalidate the client cache -> refetch -->
        <UiTooltip>
          <UiTooltipTrigger as-child>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-tanstack-border bg-tanstack-tint px-3 py-2 text-sm font-medium text-text-strong transition-all hover:border-[rgba(56,189,248,0.5)] hover:bg-[rgba(56,189,248,0.14)] sm:px-4"
              @click="invalidateQuery"
            >
              <img src="/svg/marks/query.svg" alt="" class="h-4 w-auto">
              {{ footer.vueQuery }}
            </button>
          </UiTooltipTrigger>
          <UiTooltipContent>{{ footer.vueQueryTitle }}</UiTooltipContent>
        </UiTooltip>

        <!-- Redis: wipe the apod: namespace -->
        <UiTooltip>
          <UiTooltipTrigger as-child>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-redis-border bg-redis-tint px-3 py-2 text-sm font-medium text-[#f4b4b4] transition-all hover:border-[rgba(248,113,113,0.55)] hover:bg-[rgba(248,113,113,0.16)] sm:px-4"
              @click="clearRedisCache"
            >
              <img src="/svg/marks/redis.svg" alt="" class="h-4 w-auto">
              {{ footer.redis }}
            </button>
          </UiTooltipTrigger>
          <UiTooltipContent>{{ footer.redisTitle }}</UiTooltipContent>
        </UiTooltip>
      </div>
    </div>
  </footer>
</template>
