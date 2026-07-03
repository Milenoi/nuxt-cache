<script lang="ts" setup>
// Import static text
import { common } from "~/assets/json/static-text.json";

// Redis is only ever empty right after a manual clear (otherwise the key lives
// for 24h), so the next fetch source is predictable: NASA after a clear, else
// Redis — matching what the badge will show once the data arrives.
const redisCleared = useState("redis-cleared", () => false);
const source = computed(() => (redisCleared.value ? "NASA" : "Redis"));
const logoSrc = computed(() =>
  redisCleared.value ? "/favicon.svg" : "/svg/redis.svg",
);
</script>

<template>
  <div class="loading-modal">
    <div class="loading-modal-inner">
      <span class="loader" />
      <span class="loading-text">
        {{ common.isFetchingFromLabel }} {{ source }}
        <img
          :src="logoSrc"
          :alt="source"
          class="source-logo"
          :width="redisCleared ? 110 : 369"
          :height="redisCleared ? 92 : 126"
        >
      </span>
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
  inset: 0;
  background: rgb(0 0 0 / 80%);
}

.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.source-logo {
  height: 22px;
  width: auto;
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
