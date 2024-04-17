<script setup lang="ts">
// Import static text
import {overviewPage, menu} from 'assets/json/static-text.json';


// Seo
useSeoMeta({
    title: 'Overview - Nuxt Cache',
});
</script>

<template>
    <v-container tag="section" class="my-8 overview-container">
        <h1 class="text-h4 text-sm-h2 pa-2 mb-8 mx-auto text-center">
            {{ overviewPage.title }}
        </h1>

       <v-row>
            <v-col v-for="(api, index) in overviewPage.api" :key="index" cols="12" md="6">
                <v-card class="h-100" :to="menu[api.media].link">
                     <div class="overview-image-container">
                         <NuxtPicture
                             :src="`/images/${api.media}.jpg`"
                             width="612"
                             height="381"
                             sizes="xs:927px sm:452px md:612px"
                             :imgAttrs="{class: 'overview-image',  'alt': api.meta }"
                         />

                        <img
                            :src="`/svg/${api.logo}.svg`"
                            :alt="api.meta"
                            width="464"
                            height="130"
                            class="overview-svg"
                        >
                    </div>

                    <v-card-item>
                        <v-card-title>
                         {{ api.title }}
                        </v-card-title>
                        <v-card-subtitle>
                           {{ api.subTitle }}
                        </v-card-subtitle>
                    </v-card-item>

                    <v-card-text>
                        <p class="mb-4">
                          {{ api.description }}
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style lang="scss">
.overview-container {
    max-width: 1280px !important;
}

.overview-image-container {
    position: relative;

    &:hover {
        .overview-svg {
            opacity: 1;
        }
    }
}

.overview-image {
    width: 100%;
    height: auto;
    filter: grayscale(30%);
    transition: filter 400ms ease;

    &:hover {
        filter: none;
    }
}

.overview-svg {
    position: absolute;
    top: 50%;
    left: 50%;
    opacity: 0.5;
    height: auto;
    transform: translate(-50%, -50%);
    max-width: 50%;
    transition: opacity 400ms ease;
}
</style>
