<script setup lang="ts">
import {useIsFetching} from "@tanstack/vue-query";

const alertLabel = useState("alert-label");
const alertStatus = useState("alert-status");
const showAlert = useState("alert-show");

const isFetching = useIsFetching();
</script>

<template>
  <v-layout ref="app">
    <LayoutLoadingLayer v-if="isFetching"/>
    <LayoutAppBar/>

    <Transition name="fade">
      <v-alert
          v-if="showAlert"
          class="custom-alert"
          icon="$success"
          :color="alertStatus ? 'success' : 'error'"
          :text="alertLabel as string"
      />
    </Transition>

    <v-main class="d-flex align-center justify-center">
      <slot/>
    </v-main>

    <LayoutCacheActionBar/>
    <LayoutAppFooter/>
  </v-layout>
</template>

<style lang="scss" scoped>
.custom-alert {
    position: fixed;
    z-index: 10;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 500px;
    width: calc(100% - 32px);
}
</style>
