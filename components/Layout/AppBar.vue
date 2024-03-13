<script lang="ts" setup>
// Import static text
import {common, menu} from 'assets/json/static-text.json';
import {useIsFetching} from "@tanstack/vue-query";

const drawer = ref(false);

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

const isFetching = useIsFetching();
</script>

<template>
    <v-app-bar
        :elevation="1"
        clipped-left
        rounded
        name="app-bar"
    >
        <v-app-bar-title>
           <NuxtLink to="/" class="text-decoration-none text-white">
              Nuxt Cache Project
            </NuxtLink>


        </v-app-bar-title>

           <p class="mr-8 status-currently-fetching" v-if="isFetching">
               <span class="loader"></span>
               {{ common.isFetchingNowLabel }}
           </p>

           <v-btn class="mr-4 bg-red-accent-3"
                  @click="clearRedisCache"
                  prepend-icon="mdi mdi-cached">
                 {{ common.clearRedisCacheLabel }}
            </v-btn>

        <v-app-bar-nav-icon @click.stop="drawer = !drawer"/>
     </v-app-bar>

    <v-navigation-drawer
        name="drawer"
        v-model="drawer"
        location="right"
        :width="300"
        temporary
        sticky
    >
        <v-list>
            <v-list-item v-for="(item, index) in Object.values(menu)" :key="index" :to="item.link">
               {{ item.label }}
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<style lang="scss" scoped>
.status-currently-fetching {
    display: flex;
    align-items: center;
}

.loader {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: inline-block;
    border-top: 3px solid white;
    border-right: 3px solid transparent;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    margin-right: 10px;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
