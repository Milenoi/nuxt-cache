<script setup lang="ts">
import { mdiReload, mdiCached } from "@mdi/js";
import {useQueryClient} from "@tanstack/vue-query";

// Import static text
import {common} from "~/assets/json/static-text.json";

const alertLabel = useState("alert-label", () => "");
const alertStatus = useState("alert-status", () => false);
const showAlert = useState("alert-show", () => false);
// Shared with useFetchApod: flips the badge to "nasa" after Redis is cleared.
const redisCleared = useState("redis-cleared", () => false);
// Duration of the last real fetch (ms), written by useFetchApod.
const lastFetchMs = useState<number | null>("last-fetch-ms", () => null);

const queryClient = useQueryClient();

const flashAlert = (message: string, ok: boolean) => {
  alertLabel.value = message;
  alertStatus.value = ok;
  showAlert.value = true;
  setTimeout(() => {
    showAlert.value = false;
  }, 5000);
};

const clearRedisCache = async () => {
  try {
    const data = await useClearRedisCache();
    const ok = data.status === 200;
    flashAlert(data.message, ok);
    // Redis is now empty → flip the badge to "nasa" straight away (no refetch,
    // no reload). The next "Invalidate" then really fetches from NASA.
    if (ok) redisCleared.value = true;
  } catch {
    flashAlert("Something went wrong. Redis cache was not cleared.", false);
  }
};

const invalidateQuery = async () => {
  // Await the refetch so we can report where the fresh data actually came from
  // (Redis if it's populated, otherwise straight from the NASA API). During the
  // fetch the "redisCleared" flag still drives the loader label; only afterwards
  // do we hand the badge back to the real data.redis flag.
  await queryClient.invalidateQueries();
  redisCleared.value = false;
  const cached = queryClient.getQueryData<{ redis?: string }>(["apod"]);
  const from = cached?.redis ? "Redis" : "NASA";
  const timing =
    lastFetchMs.value !== null
      ? ` in ${(lastFetchMs.value / 1000).toFixed(2)} s`
      : "";
  flashAlert(`Refetched from ${from}${timing}.`, true);
};
</script>

<template>
  <div class="layout-cache-action-bar">
    <v-btn
        class="bg-red-accent-2 cache-btn"
        :title="common.invalidate"
        :prepend-icon="mdiReload"
        @click="invalidateQuery"
    >
      <span class="app-bar-btn d-none d-sm-inline">{{ common.invalidate }}</span>
      <span class="app-bar-btn d-sm-none">{{ common.invalidateShort }}</span>
    </v-btn>
    <v-btn
        class="bg-red-accent-3 cache-btn"
        :title="common.clearRedisCacheLabel"
        :prepend-icon="mdiCached"
        @click="clearRedisCache"
    >
      <span class="app-bar-btn d-none d-sm-inline">{{ common.clearRedisCacheLabel }}</span>
      <span class="app-bar-btn d-sm-none">{{ common.clearRedisCacheShort }}</span>
    </v-btn>
  </div>
</template>

<style lang="scss">
.layout-cache-action-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: row wrap;
    gap: 16px;
    position: fixed;
    z-index: 10;
    bottom: 0;
    width: 100%;
    padding-top: 30px;
    padding-inline: 24px;
    padding-bottom: 72px; /* clear the 48px fixed footer */

    &::before {
        content: "";
        background: linear-gradient(to top, rgb(0 0 0 / 100%), rgb(0 0 0 / 0%));
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 200%;
        pointer-events: none;
    }
}

.cache-btn {
    width: 325px;
    max-width: 100%;
}

/* Mobile only: buttons smaller + side by side, smaller label, tighter spacing. */
@media (max-width: 599px) {
    .layout-cache-action-bar {
        flex-flow: row nowrap;
        gap: 10px;
        padding-inline: 12px;
        padding-bottom: 64px;
    }

    .cache-btn {
        width: auto;
        flex: 1 1 0;
        min-width: 0;
    }

    .cache-btn .app-bar-btn {
        font-size: 0.72rem;
    }
}
</style>
