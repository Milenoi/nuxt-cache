<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { hero } from "~/assets/json/static-text.json";
import type { ApodList } from "~/types";

useSeoMeta({
  title: "Nuxt Cache",
  description:
    "A Nuxt 4 demo that makes NASA's slow, rate-limited Astronomy Picture of the Day API feel instant with Redis and TanStack Vue Query caching.",
  ogTitle: "Nuxt Cache — making a slow API feel instant",
  ogDescription:
    "Multi-layer caching over NASA's APOD API: Redis on the server, TanStack Vue Query in the browser, with live cache-source badges and fetch timing.",
  twitterTitle: "Nuxt Cache — making a slow API feel instant",
  twitterDescription:
    "Multi-layer caching over NASA's APOD API: Redis on the server, TanStack Vue Query in the browser, with live cache-source badges and fetch timing.",
});

// Pull the latest APOD so the hero itself is delivered through Redis + TanStack.
const { data, serverSource, fromClientCache } = await useFetchApod<ApodList>();

const latestApod = computed(
  () => data.value?.entries?.find((entry) => entry.mediaType === "image") ?? null,
);

const heroImage = computed(
  () => latestApod.value?.hdurl ?? latestApod.value?.url ?? "/images/apod.jpg",
);

// Two cache layers, both shown when true (mirrors the old ApiLogo + gallery
// cards): the client cache (Vue Query) and the server source (Redis warm / NASA
// cold or just-cleared). serverSource already flips to "nasa" after a Redis clear.
const clientPill = {
  label: hero.client,
  layer: hero.clientLayer,
  mark: "/svg/marks/query.svg",
  cls: "bg-[rgba(6,16,28,0.62)] border-[rgba(56,189,248,0.45)] text-[#7dd3fc]",
};

const serverPill = computed(() =>
  serverSource.value === "nasa"
    ? {
        label: hero.serverNasa,
        layer: hero.serverNasaLayer,
        mark: "/svg/marks/nasa.svg",
        cls: "bg-[rgba(10,12,18,0.62)] border-[rgba(255,255,255,0.4)] text-[#fafafa]",
      }
    : {
        label: hero.serverRedis,
        layer: hero.serverRedisLayer,
        mark: "/svg/marks/redis.svg",
        cls: "bg-[rgba(20,6,6,0.62)] border-[rgba(248,113,113,0.45)] text-[#fca5a5]",
      },
);
</script>

<template>
  <section class="group relative h-screen min-h-[600px] overflow-hidden">
    <!-- Background: latest APOD, ambient slow zoom. Single <img srcset> — no art
         direction here, just one image at responsive sizes. -->
    <div class="absolute inset-0 overflow-hidden">
      <NuxtImg
        :src="heroImage"
        :alt="latestApod?.title ?? hero.tagline"
        width="1920"
        height="1080"
        sizes="100vw xl:1920px"
        densities="x1"
        fit="cover"
        format="avif"
        quality="80"
        preload
        fetchpriority="high"
        loading="eager"
        class="h-full w-full object-cover animate-[slowzoom_40s_ease-in-out_infinite_alternate]"
      />
    </div>

    <!-- Bottom-up legibility gradient -->
    <div
      class="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,0.5)_0%,rgba(5,5,6,0)_28%,rgba(5,5,6,0)_46%,rgba(5,5,6,0.72)_84%,#050506_100%)]"
    />

    <!-- Content, flush with header/footer container -->
    <div class="absolute inset-x-0 bottom-0 z-10">
      <div class="container mx-auto px-5 pb-[92px] md:px-8 md:pb-[118px]">
        <div class="mb-6 flex flex-wrap items-center gap-2">
          <!-- client cache layer -->
          <div
            v-if="fromClientCache"
            class="inline-flex items-center gap-2 rounded-full border px-[14px] py-[6px] text-[12.5px] font-medium backdrop-blur-[10px] [text-shadow:none]"
            :class="clientPill.cls"
          >
            <img :src="clientPill.mark" alt="" class="h-[13px] w-auto">
            {{ clientPill.label }}
            <span class="hidden font-normal opacity-70 sm:inline">· {{ clientPill.layer }}</span>
          </div>
          <!-- server source layer -->
          <div
            class="inline-flex items-center gap-2 rounded-full border px-[14px] py-[6px] text-[12.5px] font-medium backdrop-blur-[10px] [text-shadow:none]"
            :class="serverPill.cls"
          >
            <img :src="serverPill.mark" alt="" class="h-[13px] w-auto">
            {{ serverPill.label }}
            <span class="hidden font-normal opacity-70 sm:inline">· {{ serverPill.layer }}</span>
          </div>
        </div>

        <div
          class="mb-[22px] text-[15px] font-medium tracking-[0.01em] text-white/[0.72] [text-shadow:0_1px_18px_rgba(0,0,0,0.55)]"
        >
          {{ hero.tagline }}
          <template v-if="latestApod?.formattedDate">
            — {{ latestApod.formattedDate }}
          </template>
        </div>

        <h1
          class="m-0 max-w-[15ch] font-serif text-[clamp(48px,7.4vw,102px)] font-normal leading-[0.94] tracking-[-0.01em] text-balance [text-shadow:0_2px_30px_rgba(0,0,0,0.4)]"
        >
          {{ latestApod?.title ?? hero.tagline }}
        </h1>

        <!-- Visual CTA (the whole stage is the actual link, see below) -->
        <span
          class="mt-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.08] px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-all group-hover:border-white/40 group-hover:bg-white/[0.16]"
        >
          {{ hero.cta }}
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </div>

    <!-- The whole stage links to the gallery. -->
    <NuxtLink
      to="/apod"
      class="absolute inset-0 z-20"
      :aria-label="hero.cta"
    />
  </section>
</template>
