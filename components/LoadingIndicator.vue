<template>
  <div class="loading-spinner">
    <span class="grow-pulse spinner" />
  </div>
</template>

<style scoped lang="scss">
.loading-spinner {
  position: absolute;
  inset: 0;
  height: calc(100dvh - 100px);
}

.spinner {
  &::after {
    content: "";
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    position: absolute;
    top: calc(50% - 20px);
    left: calc(50% - 20px);
    border-radius: 50%;
    background-color: rgb(255 255 255 / 100%);
    animation: grow-pulse 1.5s ease-out infinite;
  }
}

@keyframes grow-pulse {
  0% {
    transform: scale(0.1);
    opacity: 0;
  }

  30% {
    opacity: 0.5;
  }

  60% {
    transform: scale(1.2);
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
}
</style>
