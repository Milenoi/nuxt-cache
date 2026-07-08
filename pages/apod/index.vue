<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";
import { apod } from "~/assets/json/static-text.json";
import type { ApodList, ApodMediaType } from "~/types";

const { listPage, all } = apod;

const { data, serverSource, isPending } = await useFetchApod<ApodList>();

useSeoMeta({
  title: "Recent captures - Nuxt Cache",
  description:
    "Browse the last 60 days of NASA's Astronomy Picture of the Day — images and videos, served instantly from Redis and TanStack Vue Query.",
  ogTitle: "Recent captures — Nuxt Cache",
  ogDescription:
    "The last 60 days of NASA's Astronomy Picture of the Day, filterable by images and videos and served from cache.",
  twitterTitle: "Recent captures — Nuxt Cache",
  twitterDescription:
    "The last 60 days of NASA's Astronomy Picture of the Day, filterable by images and videos and served from cache.",
});

// Media-type filter (all / image / video), synced to the URL query.
const mediaFilter = useRouteQuery<"all" | ApodMediaType>("type", "all", {
  mode: "push",
});

const filters = [
  { value: "all", label: all.filterAll },
  { value: "image", label: all.filterImages },
  { value: "video", label: all.filterVideos },
] as const;

const filteredEntries = computed(() => {
  const entries = data.value?.entries ?? [];
  if (mediaFilter.value === "image" || mediaFilter.value === "video") {
    return entries.filter((entry) => entry.mediaType === mediaFilter.value);
  }
  return entries;
});
</script>

<template>
  <section
    class="container mx-auto min-h-screen px-5 pb-40 pt-32 md:px-8 [animation:fadeUp_0.4s_ease]"
  >
    <!-- Header: tagline + heading, with the segmented media filter -->
    <div class="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div class="mb-3 text-[15px] font-medium tracking-[0.01em] text-text-muted">
          {{ listPage.title }}
        </div>
        <h1
          class="m-0 font-serif text-[clamp(42px,5.4vw,68px)] font-normal leading-none tracking-tight"
        >
          {{ listPage.heading }}
        </h1>
      </div>

      <div
        role="group"
        aria-label="Filter by media type"
        class="inline-flex items-center gap-1 rounded-[11px] border border-[#1c1c20] bg-[#0e0e11] p-1"
      >
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          :aria-pressed="mediaFilter === f.value"
          class="rounded-lg px-4 py-2 text-[13px] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          :class="
            mediaFilter === f.value
              ? 'bg-accent text-foreground'
              : 'text-text-secondary hover:text-foreground'
          "
          @click="mediaFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Loading skeletons -->
    <div
      v-if="isPending"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="overflow-hidden rounded-2xl border border-[#17171a] bg-surface-card"
      >
        <UiSkeleton class="aspect-[3/2] w-full rounded-none" />
        <div class="space-y-2 p-4">
          <UiSkeleton class="h-3 w-2/3" />
          <UiSkeleton class="h-2.5 w-2/5" />
        </div>
      </div>
    </div>

    <!-- Grid -->
    <ul
      v-else-if="filteredEntries.length"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <li v-for="entry in filteredEntries" :key="entry.date">
        <ApodCard :entry="entry" :server-source="serverSource" />
      </li>
    </ul>

    <!-- Empty -->
    <p v-else class="text-text-muted">{{ all.noResult }}</p>
  </section>
</template>
