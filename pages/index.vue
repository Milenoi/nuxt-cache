<script setup lang="ts">
// Import static text
import { overviewPage, menu } from "~/assets/json/static-text.json";
import type { ApodList } from "~/types";

// Seo
useSeoMeta({
  title: "Overview - Nuxt Cache",
});

// Pull the latest APOD so the hero itself is delivered through Redis + TanStack.
const {
  data: apodData,
  serverSource,
  fromClientCache,
} = await useFetchApod<ApodList>();
const latestApod = computed(
  () => apodData.value?.entries?.find((entry) => entry.mediaType === "image") ?? null,
);
</script>

<template>
  <v-container tag="section" class="overview-container">
    <v-row justify="center" align="center">
      <v-col
        v-for="(api, index) in overviewPage.api"
        :key="index"
        cols="12"
        md="7"
      >
        <v-card :to="menu[api.media as keyof typeof menu].link">
          <div class="overview-image-container">
            <ApiLogo
              :server-source="serverSource"
              :from-client-cache="fromClientCache"
            />
            <NuxtPicture
              :src="latestApod?.url ?? `/images/${api.media}.jpg`"
              width="1280"
              height="720"
              sizes="xs:100vw md:900px"
              quality="80"
              :preload="{ fetchPriority: 'high' }"
              :img-attrs="{
                class: 'overview-image',
                alt: latestApod?.title ?? api.meta,
                fetchpriority: 'high',
                loading: 'eager',
              }"
            />

            <img
              :src="`/svg/${api.logo}.svg`"
              :alt="api.meta"
              width="464"
              height="130"
              class="overview-svg"
            >
          </div>

          <v-card-item>
            <v-card-title>
              {{ api.title }}
            </v-card-title>
            <v-card-subtitle>
              {{ api.subTitle }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <p class="mb-4">
              {{ api.description }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss">
.overview-container {
  max-width: 1520px !important;
  /* Fill the viewport so the landing page doesn't scroll.
     v-main already offsets the app-bar (top) and footer (bottom). */
  min-height: calc(100dvh - 112px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 96px; /* clear the fixed cache action bar */
}

.overview-image-container {
  position: relative;

  &:hover {
    .overview-svg {
      opacity: 1;
    }
  }
}

.overview-image {
  width: 100%;
  /* One fixed aspect ratio everywhere — no per-viewport crop changes. */
  aspect-ratio: 16 / 9;
  height: auto;
  object-fit: cover;
  filter: grayscale(30%);
  transition: filter 400ms ease;

  &:hover {
    filter: none;
  }
}

.overview-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 0.5;
  height: auto;
  transform: translate(-50%, -50%);
  max-width: 50%;
  transition: opacity 400ms ease;
}
</style>
