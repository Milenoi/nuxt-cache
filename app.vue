<script setup lang="ts">
useHead({
  meta: [
    {
      name: "msapplication-TileColor",
      content: "#2c2d33",
    },
    {
      name: "theme-color",
      content: "#0b3d91",
    },
    {
      name: "charset",
      content: "utf-8",
    },
    {
      name: "description",
      content: "My personal Nuxt Cache Project",
    },
  ],
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/favicon.svg",
    },
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
    },
  ],
});
</script>

<template>
  <NuxtLoadingIndicator
    :color="'#66BB6A'"
    :duration="2000"
    :height="3"
    :throttle="200"
  />

  <NuxtLayout>
    <v-app>
      <NuxtPage />
    </v-app>
  </NuxtLayout>
</template>

<style lang="scss">
/* stylelint-disable selector-class-pattern */
.v-application__wrap {
  min-height: 0 !important;
  padding-block-end: 160px !important;
}

.fade-enter-active,
.fade-leave-active {
  opacity: 0;
  transition: opacity 400ms;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.image-container {
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: linear-gradient(to bottom, rgb(0 0 0 / 80%), transparent);
  }
}

.img-fit-detail {
  width: 100%;
  height: auto;
  display: block;
}

.img-fit {
  object-fit: cover;
  aspect-ratio: 16/9;
  width: 100%;
  height: auto;
}

.v-slide-group__content {
  flex-flow: row wrap !important;
  justify-content: center !important;
  flex: fit-content !important;
}
</style>
