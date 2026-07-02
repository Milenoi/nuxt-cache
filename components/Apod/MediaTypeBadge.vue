<script setup lang="ts">
// Import static text
import { apod } from "assets/json/static-text.json";

const { all } = apod;
</script>

<template>
  <v-chip class="apod-media-badge" size="small" color="black" variant="flat">
    <v-icon icon="mdi mdi-play-circle" start />
    {{ all.videoLabel }}
  </v-chip>
</template>

<style scoped lang="scss">
.apod-media-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}
</style>
