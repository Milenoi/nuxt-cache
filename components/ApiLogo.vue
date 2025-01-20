<script setup lang="ts">
defineProps({
  logo: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <v-tooltip :text="`Data source from ${logo}`">
    <template #activator="{ props }">
      <img
        v-bind="props"
        :src="`/svg/${logo}.svg`"
        :alt="logo"
        :title="logo"
        width="464"
        height="130"
        class="api-logo"
        :class="`${logo}-api-logo`"
      >
    </template>
  </v-tooltip>
</template>

<style lang="scss" scoped>
.api-logo {
  position: absolute;
  width: 50px;
  height: auto;
  top: 1rem;
  left: 1rem;

  &.nasa-api-logo {
    opacity: 0.5;
  }
}
</style>
