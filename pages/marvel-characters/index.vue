<script setup lang="ts">
// Import static text
import {marvelCharacters, menu, common} from 'assets/json/static-text.json';

// Seo
useSeoMeta({
    title: 'Marvel Characters - Nuxt Cache',
});

// Get static text
const {listPage, all} = marvelCharacters;

// Fetch Mars Rover Photos
const superHeroIds = '1009368,1009220,1010744,1009664,1009351,1009697,1009663,1009189,1017300,1011054,1009187,1009338';
const {data: marvelData, isLoading, isFetching, isPending, refetch} = await useFetchMarvelData(superHeroIds);

/**
 * Truncates the input text if it exceeds the maximum length by words.
 *
 * @param {string} text - the input text to be truncated
 * @param {number} maxLength - the maximum length of the truncated text
 * @return {string} the truncated text
 */
const truncateText = (text: string, maxLength: number): string => {
    const words = text.split(' ');
    if (words.length > maxLength) {
        return words.slice(0, maxLength).join(' ') + '...';
    } else {
        return text;
    }
}
</script>

<template>
    <LoadingIndicator v-if="isFetching || isLoading || isPending"/>

    <v-container v-else-if="marvelData" tag="section" class="my-8">
        <p class="text-center mb-4 mb-lg-12">
              <v-btn to="/" prepend-icon="mdi mdi-arrow-left">
                 {{ common.backLabel }}
            </v-btn>
         </p>

        <h1 class="text-h4 text-sm-h2 pa-2 mb-4 mx-auto text-center">
            {{ listPage.title }}
        </h1>

        <p class="text-center mb-12">
            {{ marvelData?.attributionText }}
       </p>

        <v-row v-if="marvelData.results?.length > 0">
            <v-col
                v-for="(item, index) in marvelData.results"
                :key="index"
                cols="12"
                sm="6"
                md="4"
                lg="3"
            >
                <v-card :to="`${menu.marvel.link}/${item.id}`" class="h-100">
                   <div class="image-container">
                        <ApiLogo :logo="marvelData.redis ? 'redis' : 'marvel'"/>

                        <NuxtPicture
                            :src="item.thumbnail.path + '.' + item.thumbnail.extension"
                            width="567"
                            height="319"
                            sizes="xs:567px sm:452px md:273px lg:424px xl:574px"
                            :imgAttrs="{class:'img-fit',  'alt': item.name }"
                        />
                    </div>

                    <v-card-item>
                        <v-card-title>
                        {{ item.name }}
                    </v-card-title>

                    <v-card-subtitle>
                      {{ all.updated }}:  {{ item.modified }}
                    </v-card-subtitle>
                </v-card-item>
                <v-card-text>
                    <p class="mb-4">
                        {{ truncateText(item.description, 15) }}
                    </p>
                </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row v-else>
            <p class="text-center w-100">{{ listPage.noResult }}</p>
        </v-row>
    </v-container>
</template>
