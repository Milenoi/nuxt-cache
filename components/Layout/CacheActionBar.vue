<script setup lang="ts">
import {useQueryClient} from "@tanstack/vue-query";

// Import static text
import {common} from "assets/json/static-text.json";

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
        class="my-2 mx-2 bg-red-accent-2 min-width-300"
        :title="common.invalidate"
        prepend-icon="mdi mdi-reload"
        @click="invalidateQuery"
    >
      <span class="app-bar-btn">
        {{ common.invalidate }}
      </span>
    </v-btn>
    <v-btn
        class="my-2 mx-2 bg-red-accent-3 min-width-300"
        :title="common.clearRedisCacheLabel"
        prepend-icon="mdi mdi-cached"
        @click="clearRedisCache"
    >
      <span class="app-bar-btn">
        {{ common.clearRedisCacheLabel }}
      </span>
    </v-btn>
  </div>
</template>

<style lang="scss">
.layout-cache-action-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: row wrap;
    position: fixed;
    z-index: 10;
    bottom: 40px;
    width: 100%;
    padding-block: 30px;

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

.min-width-300 {
    width: 325px;
}
</style>
