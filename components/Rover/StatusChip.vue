<script setup lang="ts">
// Import static text
import { marsPhotos } from "assets/json/static-text.json";

const { all } = marsPhotos;
</script>

<template>
  <v-tooltip :text="all.activeStatusLabel">
    <template #activator="{ props }">
      <div v-bind="props" class="rover-active-status" />
    </template>
  </v-tooltip>
</template>

<style scoped lang="scss">
.rover-active-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 10px;
  height: 10px;
  border-radius: 50px;
  box-shadow:
    0 0 8px #66bb6a,
    inset 0 0 8px #66bb6a;
  animation: pulse 2s linear 1s infinite;
  background: #66bb6a;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    box-shadow:
      0 0 10px #66bb6a,
      inset 0 0 10px #66bb6a;
  }

  50% {
    transform: scale(1);
    box-shadow:
      0 0 18px #66bb6a,
      inset 0 0 16px #66bb6a;
  }

  100% {
    transform: scale(0.9);
    box-shadow:
      0 0 10px #66bb6a,
      inset 0 0 10px #66bb6a;
  }
}
</style>
