<script setup>
// Import static text
import { marsPhotos, common } from "assets/json/static-text.json";
import ApiLogo from "~/components/ApiLogo.vue";

const { detailPage, all } = marsPhotos;

const route = useRoute();

// Fetch Mars Rover Photo
const {
  data: item,
  isLoading,
  isFetching,
  isPending,
} = await useFetchMarsRoverPhotos(route.params.id);
</script>

<template>
  <LoadingIndicator v-if="isFetching || isLoading || isPending" />

  <v-container v-else-if="item" tag="section" class="my-8">
    <p class="text-center mb-4 mb-lg-12">
      <v-btn to="/mars-rover-photos" prepend-icon="mdi mdi-arrow-left">
        {{ common.backLabel }}
      </v-btn>
    </p>

    <h1 class="text-h4 text-sm-h2 pa-2 mb-4 mx-auto text-center">
      {{ detailPage.title }}
    </h1>

    <p v-if="item" class="text-center mb-12">
      ...{{ all.fromLabel }} {{ item.earth_date }} /
      {{ detailPage.marsDayLabel }} {{ item.sol }}
    </p>

    <v-row v-if="item">
      <v-col>
        <v-card class="h-100 mx-auto" max-width="1200">
          <div class="image-container">
            <RoverStatusChip v-if="item.rover?.status" />
            <ApiLogo :logo="item.redis ? 'redis' : 'nasa'" />

            <NuxtPicture
              v-if="item?.img_src"
              :src="item?.img_src"
              width="1000"
              height="657"
              sizes="xs:927px sm:868px md:1000px"
              :img-attrs="{
                class: 'img-fit-detail',
                alt: item.camera?.full_name,
              }"
            />
          </div>

          <v-card-item>
            <v-card-title>
              {{ item.rover?.name }}
            </v-card-title>
            <v-card-subtitle>
              {{ item.rover?.total_photos }} {{ all.photosLabel }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <p class="mb-4">
              <span class="text-orange-darken-2">
                {{ item.camera?.full_name }}
              </span>
              <span class="text-grey-lighten-1">({{ item.camera?.name }})</span>
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <p class="text-center w-100 my-8">{{ all.noResult }}</p>
    </v-row>
  </v-container>
</template>
