<script setup lang="ts">
import type { ApodEntry } from "~/types";

defineProps<{ entry: ApodEntry }>();
</script>

<template>
  <div class="apod-thumbnail">
    <ApodMediaTypeBadge v-if="entry.mediaType === 'video'" />

    <!-- Image entry -->
    <NuxtPicture
      v-if="entry.mediaType === 'image'"
      :src="entry.url"
      width="567"
      height="319"
      sizes="xs:567px sm:452px md:273px lg:424px xl:574px"
      :img-attrs="{ class: 'img-fit', alt: entry.title }"
    />

    <!-- Video with a provided thumbnail (e.g. YouTube) -->
    <NuxtPicture
      v-else-if="entry.mediaType === 'video' && entry.thumbnailUrl"
      :src="entry.thumbnailUrl"
      width="567"
      height="319"
      sizes="xs:567px sm:452px md:273px lg:424px xl:574px"
      :img-attrs="{ class: 'img-fit', alt: entry.title }"
    />

    <!-- Video file without a thumbnail: use the first frame as poster -->
    <video
      v-else-if="entry.mediaType === 'video'"
      :src="entry.url"
      class="img-fit"
      preload="metadata"
      muted
      playsinline
    />

    <!-- Anything else (rare 'other' media type) -->
    <div v-else class="apod-thumbnail-fallback img-fit">
      <v-icon icon="mdi mdi-telescope" size="48" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.apod-thumbnail {
  position: relative;
}

.apod-thumbnail-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 8%);
}
</style>
