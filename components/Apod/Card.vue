<script setup lang="ts">
import { Play, Telescope } from "lucide-vue-next";
import { apod, menu } from "~/assets/json/static-text.json";
import type { ApodEntry, ApodSource } from "~/types";

const props = defineProps<{ entry: ApodEntry; serverSource: ApodSource }>();

const to = computed(() => `${menu.apod.link}/${props.entry.date}`);
const isVideo = computed(() => props.entry.mediaType === "video");
// Thumbnail: the image itself, or a video's provided thumbnail.
const imageSrc = computed(() =>
  props.entry.mediaType === "image"
    ? props.entry.url
    : props.entry.thumbnailUrl || null,
);
</script>

<template>
  <NuxtLink
    :to="to"
    class="group block overflow-hidden rounded-2xl border border-[#17171a] bg-surface-card"
  >
    <div class="relative aspect-[3/2] overflow-hidden">
      <NuxtImg
        v-if="imageSrc"
        :src="imageSrc"
        :alt="entry.title"
        width="600"
        height="400"
        sizes="100vw sm:50vw lg:420px"
        densities="x1"
        fit="cover"
        format="avif"
        quality="70"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
      />
      <video
        v-else-if="isVideo"
        :src="entry.url"
        class="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        preload="metadata"
        muted
        playsinline
      />
      <div v-else class="flex h-full w-full items-center justify-center text-text-faint">
        <Telescope class="h-8 w-8" />
      </div>

      <!-- both-cache badge -->
      <ApodCacheBadge :server-source="serverSource" class="absolute left-3 top-3" />

      <!-- video overlays -->
      <template v-if="isVideo">
        <span
          class="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.16] bg-[rgba(6,6,8,0.6)] px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm"
        >
          <Play class="h-3 w-3 fill-white" />
          {{ apod.all.videoLabel }}
        </span>
        <span class="pointer-events-none absolute inset-0 grid place-items-center">
          <span
            class="grid size-[54px] place-items-center rounded-full border border-white/50 bg-[rgba(6,6,8,0.42)] text-white backdrop-blur-sm"
          >
            <Play class="h-5 w-5 fill-white" />
          </span>
        </span>
      </template>
    </div>

    <div class="p-4">
      <time :datetime="entry.date" class="mb-1.5 block text-xs text-text-faint">
        {{ entry.formattedDate }}
      </time>
      <h3 class="text-[15px] font-medium leading-snug tracking-tight text-foreground">
        {{ entry.title }}
      </h3>
      <p v-if="entry.copyright" class="mt-2 truncate text-xs text-text-faint">
        © {{ entry.copyright }}
      </p>
    </div>
  </NuxtLink>
</template>
