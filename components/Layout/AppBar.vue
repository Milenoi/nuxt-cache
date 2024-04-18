<script lang="ts" setup>
// Import static text
import {common, menu} from 'assets/json/static-text.json';

const drawer = ref(false);
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
               {{ common.projectTitle }}
            </NuxtLink>
        </v-app-bar-title>
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
