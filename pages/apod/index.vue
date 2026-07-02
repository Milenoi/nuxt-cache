<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";

// Import static text
import { apod, menu, common } from "~/assets/json/static-text.json";
import type { ApodList, ApodMediaType } from "~/types";

const { listPage, all } = apod;

// Fetch APOD list
const {
  data: apodData,
  isLoading,
  isFetching,
  isPending,
} = await useFetchApod<ApodList>();

// Seo
useSeoMeta({
  title: "Astronomy Picture of the Day - Nuxt Cache",
});

// Media-type filter (all / image / video), synced to the URL query
const mediaFilter = useRouteQuery<"all" | ApodMediaType>("type", "all", {
  mode: "push",
});

const filters: { value: "all" | ApodMediaType; label: string; icon: string }[] =
  [
    { value: "all", label: all.filterAll, icon: "mdi mdi-view-grid" },
    { value: "image", label: all.filterImages, icon: "mdi mdi-image" },
    { value: "video", label: all.filterVideos, icon: "mdi mdi-play-circle" },
  ];

const filteredEntries = computed(() => {
  const entries = apodData.value?.entries ?? [];

  if (mediaFilter.value === "image" || mediaFilter.value === "video") {
    return entries.filter((entry) => entry.mediaType === mediaFilter.value);
  }

  return entries;
});
</script>

<template>
  <LoadingIndicator v-if="isFetching || isLoading || isPending" />

  <v-container v-else-if="apodData" tag="section" class="my-8">
    <p class="text-center mb-4 mb-lg-12">
      <v-btn to="/" prepend-icon="mdi mdi-arrow-left">
        {{ common.backLabel }}
      </v-btn>
    </p>

    <h1 class="text-h4 text-sm-h2 pa-2 mb-4 mx-auto text-center">
      {{ listPage.title }}
    </h1>

    <v-row class="d-flex justify-center mb-8">
      <v-chip-group v-model="mediaFilter" mandatory selected-class="apod-chip-active">
        <v-chip
          v-for="filter in filters"
          :key="filter.value"
          :value="filter.value"
          class="ma-2 rounded-lg"
        >
          <v-icon :icon="filter.icon" class="mr-2" />
          {{ filter.label }}
        </v-chip>
      </v-chip-group>
    </v-row>

    <v-row v-if="filteredEntries.length > 0">
      <transition-group name="fade">
        <v-col
          v-for="entry in filteredEntries"
          :key="entry.date"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card :to="`${menu.apod.link}/${entry.date}`" class="h-100">
            <div class="image-container">
              <ApiLogo :logo="apodData.redis ? 'redis' : 'nasa'" />
              <ApodThumbnail :entry="entry" />
            </div>

            <v-card-item>
              <v-card-title>
                {{ entry.title }}
              </v-card-title>
              <v-card-subtitle>
                {{ all.fromLabel }} {{ entry.formattedDate }}
              </v-card-subtitle>
            </v-card-item>
            <v-card-text v-if="entry.copyright">
              <p class="mb-4 text-grey-lighten-1">© {{ entry.copyright }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </transition-group>
    </v-row>
    <v-row v-else>
      <p class="text-center w-100">{{ all.noResult }}</p>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.apod-chip-active {
  background-color: #f57c00;
  color: #fff;
}
</style>
