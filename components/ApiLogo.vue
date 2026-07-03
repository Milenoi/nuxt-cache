<script setup lang="ts">
import type { ApodSource } from "~/types";

// Two badges side by side, same height:
// - a TanStack badge when the data came from the client cache (no network)
// - the server source (redis / nasa)
defineProps<{
  serverSource: ApodSource;
  fromClientCache?: boolean;
}>();
</script>

<template>
  <div class="cache-badges">
    <!-- constant tanstack badge first (left); the changing server badge sits to
         its right so swapping redis <-> nasa never shifts anything beside it -->
    <Transition name="badge-fade" appear>
      <img
        v-if="fromClientCache"
        src="/svg/tanstack.svg"
        alt="Served from the TanStack Query client cache"
        title="Served from the TanStack Query client cache"
        class="cache-badge tanstack-badge"
      >
    </Transition>
    <!-- keyed by source so switching redis <-> nasa cross-fades instead of a hard swap -->
    <Transition name="badge-fade" mode="out-in" appear>
      <img
        :key="serverSource"
        :src="serverSource === 'nasa' ? '/favicon.svg' : `/svg/${serverSource}.svg`"
        :alt="`Server source: ${serverSource}`"
        :title="`Server source: ${serverSource}`"
        class="cache-badge"
        :class="`${serverSource}-badge`"
      >
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.cache-badges {
  position: absolute;
  z-index: 2;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* redis and nasa share the same height so the swap doesn't jump vertically */
.cache-badge {
  height: 22px;
  width: auto;
}

/* the wordmark reads a touch tall next to the marks — nudge it down */
.tanstack-badge {
  height: 20px;
}

/* soft fade for badge appear / source switch */
.badge-fade-enter-active,
.badge-fade-leave-active {
  transition: opacity 0.4s ease;
}

.badge-fade-enter-from,
.badge-fade-leave-to {
  opacity: 0;
}
</style>
