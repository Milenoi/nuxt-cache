<script setup>
defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const handleClearError = () => {
  clearError({ redirect: "/" });
};
</script>

<template>
  <v-layout ref="app">
    <LayoutAppBar />
    <v-main class="d-flex align-center justify-center h-100 error-page">
      <v-container tag="section" class="my-8 h-100 text-center">
        <h1 class="text-h2">{{ error.statusCode }}</h1>
        <p class="text-center my-8">
          {{ error.message }}
        </p>

        <p>
          <v-btn prepend-icon="mdi mdi-arrow-left" @click="handleClearError">
            Zurück
          </v-btn>
        </p>
      </v-container>
    </v-main>
    <LayoutFooter />
  </v-layout>
</template>

<style lang="scss" scoped>
.error-page {
  min-height: 100dvh;
}
</style>
