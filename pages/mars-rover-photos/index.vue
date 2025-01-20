<script setup>
import {useRouteQuery} from "@vueuse/router";

// Import static text
import {marsPhotos, menu, common} from "assets/json/static-text.json";
import ApiLogo from "~/components/ApiLogo.vue";

const {listPage, all} = marsPhotos;

// Fetch Mars Rover Photos
const {
    data: nasaData,
    isLoading,
    isFetching,
    isPending,
} = await useFetchMarsRoverPhotos();

// Seo
useSeoMeta({
    title: "Mars Rover Photos - Nuxt Cache",
});

// Filter Mars Rover Photos
const selectedCameraChipIndexes = ref([]);

const cameraFilterChips = computed(() => {
    return nasaData.value.cameras.map((camera) => camera.name);
});

const selectedCameraChips = computed(() => {
    return selectedCameraChipIndexes.value.map((chip) => {
        return cameraFilterChips.value[chip];
    });
});

const filteredNasaData = computed(() => {
    if (selectedCameraChips.value?.length === 0) {
        return nasaData.value.entries;
    }

    return nasaData.value.entries.filter((item) => {
        return selectedCameraChips.value.includes(item.camera.name);
    });
});

// Get query values for preselect
const getCameraQuery = useRouteQuery("camera", null, {mode: "push"});

onMounted(() => {
    if (nasaData.value && getCameraQuery.value) {
        // Build array from camera query params
        const selectedCameras = getCameraQuery.value
            .split(",")
            .map((camera) => camera.trim());

        // Now match preselected cameras to index
        const preSelectedIndexes = selectedCameras.map((camera) => {
            return nasaData.value.cameras.findIndex((item) => {
                return item.total_photos > 0 && item.name === camera;
            });
        });

        // Set preselected indexes
        selectedCameraChipIndexes.value = preSelectedIndexes.filter(
            (index) => index !== -1,
        ); // Remove -1 indexes (not found)
    }
});

// Watch for changes in selected chips and update query params
watch(selectedCameraChipIndexes, (newValue) => {
    if (newValue) {
        getCameraQuery.value = newValue
            .map((index) => nasaData.value.cameras[index].name)
            .join(",");
    }
});
</script>

<template>
  <LoadingIndicator v-if="isFetching || isLoading || isPending"/>

  <v-container v-else-if="nasaData" tag="section" class="my-8">
    <p class="text-center mb-4 mb-lg-12">
      <v-btn to="/" prepend-icon="mdi mdi-arrow-left">
        {{ common.backLabel }}
      </v-btn>
    </p>

    <h1 class="text-h4 text-sm-h2 pa-2 mb-4 mx-auto text-center">
      {{ listPage.title }}
    </h1>

    <p class="text-center mb-12">
      {{ listPage.launchDate }}: {{ nasaData.launch_date }}
      /
      {{ listPage.landingDate }}: {{ nasaData.landing_date }}
      <br>
      {{ listPage.lastUpdate }}: {{ nasaData.max_date }}
    </p>

    <v-row class="d-flex justify-center mb-8">
      <v-chip-group v-model="selectedCameraChipIndexes" multiple>
        <v-chip
            v-for="(camera, index) in nasaData.cameras"
            :key="index"
            :disabled="camera.total_photos === 0"
            class="ma-2 rounded-lg"
        >
          <v-icon
              v-if="camera.total_photos === 0"
              icon="mdi mdi-cctv-off"
              class="mr-2"
          />
          <v-icon v-else icon="mdi mdi-cctv" class="mr-2"/>

          {{ camera.name }}
          <span class="text-grey-darken-1 ml-1">
            {{ camera.total_photos ? `(${camera.total_photos})` : "" }}
          </span>
        </v-chip>
      </v-chip-group>
    </v-row>

    <v-row v-if="filteredNasaData.length > 0">
      <transition-group name="fade">
        <v-col
            v-for="(item, index) in filteredNasaData"
            :key="item.img_src + index"
            cols="12"
            sm="6"
            md="4"
            lg="3"
        >
          <v-card :to="`${menu.mars.link}/${item.index}`" class="h-100">
            <div class="image-container">
              <RoverStatusChip v-if="item.rover.status"/>
              <ApiLogo :logo="nasaData.redis ? 'redis' : 'nasa'"/>

              <NuxtPicture
                  :src="item.img_src"
                  width="567"
                  height="319"
                  sizes="xs:567px sm:452px md:273px lg:424px xl:574px"
                  :img-attrs="{ class: 'img-fit', alt: item.camera.full_name }"
              />
            </div>

            <v-card-item>
              <v-card-title>
                {{ item.rover.name }}
              </v-card-title>
              <v-card-subtitle>
                {{ item.rover.total_photos }}
                {{ all.photosLabel }}
              </v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <p class="mb-4">
                <v-icon icon="mdi mdi-cctv"/>
                {{ listPage.cameraLabel }}:
                <br>
                <span class="text-orange-darken-2">
                  {{ item.camera.full_name }}
                </span>
                <span class="text-grey-lighten-1">
                  ({{ item.camera.name }})
                </span>
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </transition-group>
    </v-row>
    <v-row v-else>
      <p class="text-center w-100">{{ listPage.noResult }}</p>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.v-chip {
    /* stylelint-disable selector-class-pattern */
    &.v-chip--selected {
        background-color: #f57c00;
        color: #fff;

        span {
            color: inherit !important;
        }
    }
}
</style>
