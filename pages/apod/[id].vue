<script setup lang="ts">
import { mdiArrowLeft } from "@mdi/js";

// Import static text
import { apod, common } from "~/assets/json/static-text.json";
import type { ApodEntry } from "~/types";

const { all } = apod;

const route = useRoute();

// Fetch a single APOD entry by date
const {
  data: item,
  serverSource,
  fromClientCache,
  isLoading,
  isFetching,
  isPending,
} = await useFetchApod<ApodEntry>(route.params.id as string);

// Seo
useSeoMeta({
  title: () => `${item.value?.title ?? "Astronomy Picture of the Day"} - Nuxt Cache`,
});

const embed = computed(() =>
  item.value?.mediaType === "video" ? getApodEmbed(item.value.url) : null,
);
</script>

<template>
  <LoadingIndicator v-if="isFetching || isLoading || isPending" />

  <v-container v-else-if="item" tag="section" class="my-8">
    <p class="text-center mb-4 mb-lg-12">
      <v-btn to="/apod" :prepend-icon="mdiArrowLeft">
        {{ common.backLabel }}
      </v-btn>
    </p>

    <h1
      class="text-h4 text-sm-h2 pa-2 mb-4 mx-auto text-center detail-page-headline"
    >
      {{ item.title }}
    </h1>

    <p class="text-center mb-12 mx-auto detail-page-description">
      {{ all.fromLabel }} {{ item.formattedDate }}
    </p>

    <v-row>
      <v-col>
        <v-card class="h-100 mx-auto" max-width="1000">
          <div class="position-relative">
            <ApiLogo
              :server-source="serverSource"
              :from-client-cache="fromClientCache"
            />

            <!-- Image -->
            <NuxtPicture
              v-if="item.mediaType === 'image'"
              :src="item.hdurl || item.url"
              width="1000"
              height="657"
              sizes="xs:927px sm:868px md:1000px"
              :img-attrs="{ class: 'img-fit-detail', alt: item.title }"
            />

            <!-- Video: embeddable provider (YouTube / Vimeo) -->
            <div
              v-else-if="
                embed && (embed.type === 'youtube' || embed.type === 'vimeo')
              "
              class="apod-embed"
            >
              <iframe
                :src="embed.src"
                title="APOD video"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>

            <!-- Video: direct media file -->
            <video
              v-else-if="embed && embed.type === 'file'"
              :src="embed.src"
              class="img-fit-detail"
              controls
              playsinline
            />

            <!-- Fallback: link out to the source -->
            <p v-else class="pa-8 text-center">
              <v-btn :href="item.url" target="_blank" rel="noopener noreferrer">
                {{ all.viewSourceLabel }}
              </v-btn>
            </p>
          </div>

          <v-card-item v-if="item.copyright">
            <v-card-subtitle>© {{ item.copyright }}</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <p class="mb-4">{{ item.explanation }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss">
.detail-page-headline,
.detail-page-description {
  max-width: 1000px;
}

.apod-embed {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
