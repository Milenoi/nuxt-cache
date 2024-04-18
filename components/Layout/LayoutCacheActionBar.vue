<script setup lang="ts">
import {useQueryClient} from "@tanstack/vue-query";

// Import static text
import {common} from 'assets/json/static-text.json';

const alertLabel = useState('alert-label', () => '');
const alertStatus = useState('alert-status', () => false);
const showAlert = useState('alert-show', () => false);

const clearRedisCache = async () => {
    try {
        const {data} = await useClearRedisCache();

        alertLabel.value = data.value.message;
        alertStatus.value = data.value.status === 200;
    } catch (error) {
        alertLabel.value = "Something went wrong. Redis Cache was not cleared."
        alertStatus.value = false;
    } finally {
        showAlert.value = true;

        setTimeout(() => {
            showAlert.value = false
        }, 5000);
    }
}

// Get QueryClient from the context
const queryClient = useQueryClient()

const invalidateQuery = () => {
    queryClient.invalidateQueries()
}
</script>

<template>
 <div class="layout-cache-action-bar">
    <v-btn class="my-2 mx-2 bg-red-accent-2 min-width-300"
           @click="invalidateQuery"
           :title="common.invalidate"
           prepend-icon="mdi mdi-reload">

                <span class="app-bar-btn">
                    {{ common.invalidate }}
                </span>
        </v-btn>
    <v-btn class="my-2 mx-2 bg-red-accent-3 min-width-300"
           @click="clearRedisCache"
           :title="common.clearRedisCacheLabel"
           prepend-icon="mdi mdi-cached">
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
        bottom: 70px;
        width: 100%;
    }

    .min-width-300 {
        min-width: 300px;
    }
</style>
