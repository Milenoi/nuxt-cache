<script setup lang="ts">
// Import static text
import {marsPhotos} from 'assets/json/static-text.json';

const {all} = marsPhotos;
</script>

<template>
     <v-tooltip :text="all.activeStatusLabel">
      <template v-slot:activator="{ props }">
          <div v-bind="props" class="rover-active-status"></div>
      </template>
    </v-tooltip>
</template>

<style scoped lang="scss">
.rover-active-status {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 10px;
    height: 10px;
    border-radius: 50px;
    box-shadow: 0 0 8px #66BB6A, inset 0 0 8px #66BB6A;
    animation: pulse 2s linear 1s infinite;
    background: #66BB6A;
}

@keyframes pulse {
    0% {
        transform: scale(0.9);
        box-shadow: 0 0 10px #66BB6A, inset 0 0 10px #66BB6A;
    }
    50% {
        transform: scale(1);
        box-shadow: 0 0 18px #66BB6A, inset 0 0 16px #66BB6A;
    }
    100% {
        transform: scale(0.9);
        box-shadow: 0 0 10px #66BB6A, inset 0 0 10px #66BB6A;
    }
}
</style>
