<script setup lang="ts">
import { mdiReload, mdiCached } from "@mdi/js";
import {useQueryClient} from "@tanstack/vue-query";

// Import static text
import {common} from "~/assets/json/static-text.json";

const alertLabel = useState("alert-label", () => "");
const alertStatus = useState("alert-status", () => false);
const showAlert = useState("alert-show", () => false);

const clearRedisCache = async () => {
    try {
        const data = await useClearRedisCache();

        alertLabel.value = data.message;
        alertStatus.value = data.status === 200;
    } catch (error) {
        alertLabel.value = "Something went wrong. Redis Cache was not cleared.";
        alertStatus.value = false;

        console.log(error)
    } finally {
        showAlert.value = true;

        setTimeout(() => {
            showAlert.value = false;
        }, 5000);
    }
};

// Get QueryClient from the context
const queryClient = useQueryClient();

const invalidateQuery = () => {
    queryClient.invalidateQueries();
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
