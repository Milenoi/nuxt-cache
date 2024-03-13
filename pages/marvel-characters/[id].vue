<script setup>
// Import static text
import {marvelCharacters} from 'assets/json/static-text.json';
import ApiLogo from "~/components/ApiLogo.vue";

const {detailPage, common} = marvelCharacters;

const route = useRoute();

const {data: item, isLoading, isFetching, isPending} = await useFetchMarvelData(route.params.id);
</script>

<template>
    <LoadingIndicator v-if="isFetching || isFetching || isPending"/>

    <v-container v-else-if="item" tag="section" class="my-8">
         <p class="text-center mb-4 mb-lg-12">
              <v-btn to="/marvel-characters" prepend-icon="mdi mdi-arrow-left">
                 {{ common.backLabel }}
            </v-btn>
         </p>

        <h1 class="text-h4 text-sm-h2 pa-2 mb-4 mx-auto text-center detail-page-headline">
            {{ item.results[0]?.name }}
        </h1>

        <p class="text-center mb-12 mx-auto detail-page-description">
            {{ item.results[0]?.description }}
        </p>

        <v-row>
          <v-col>
            <v-card class="h-100 mx-auto " max-width="850">
                <div class="position-relative">
                     <ApiLogo :logo="item.redis ? 'redis' : 'marvel'"/>

                     <NuxtPicture
                         :src="item.results[0]?.thumbnail?.path + '.' + item.results[0]?.thumbnail?.extension"
                         width="850"
                         height="850"
                         sizes="xs:927px sm:868px md:1000px"
                         :imgAttrs="{class:'img-fit-detail', 'alt': item.results[0]?.name }"
                     />
                </div>

                <v-card-item>
                    <v-card-subtitle>
                        {{ item.attributionText }}
                    </v-card-subtitle>
                </v-card-item>

                <v-card-text>
                 <v-table>
                <thead>
                  <tr>
                    <th class="text-left">
                      {{ detailPage.statisticsLabel }}
                    </th>
                    <th class="text-left">
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ detailPage.comics }}</td>
                    <td>{{ item.results[0]?.comics.available }}</td>
                  </tr>
                  <tr>
                    <td>{{ detailPage.series }}</td>
                    <td>{{ item.results[0]?.series.available }}</td>
                  </tr>
                  <tr>
                    <td>{{ detailPage.stories }}</td>
                    <td>{{ item.results[0]?.stories.available }}</td>
                  </tr>
                  <tr>
                    <td>{{ detailPage.events }}</td>
                    <td>{{ item.results[0]?.events.available }}</td>
                  </tr>
                </tbody>
              </v-table>
                </v-card-text>
            </v-card>
          </v-col>
        </v-row>
    </v-container>
</template>

<style lang="scss">
.detail-page-headline,
.detail-page-description {
    max-width: 850px;
}
</style>
