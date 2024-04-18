<script lang="ts" setup>
// Import static text
import {common} from 'assets/json/static-text.json';
</script>

<template>
    <div class="loading-modal">
        <div class="loading-modal-inner">
            <span class="loader"></span>
            {{ common.isFetchingNowLabel }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.loading-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    width: 100%;
    z-index: 100;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
}

.loader {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: block;
    border-top: 3px solid white;
    border-right: 3px solid transparent;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    margin: 30px auto;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
