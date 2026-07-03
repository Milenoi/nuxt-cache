<script setup lang="ts">
const { siteName, siteDescription, siteUrl } = useRuntimeConfig().public;
const ogImage = `${siteUrl}/og-image.jpg`;

// Global SEO + social share defaults (pages can override title via useSeoMeta).
useSeoMeta({
  description: siteDescription,
  ogSiteName: siteName,
  ogType: "website",
  ogTitle: siteName,
  ogDescription: siteDescription,
  ogUrl: siteUrl,
  ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: "summary_large_image",
  twitterTitle: siteName,
  twitterDescription: siteDescription,
  twitterImage: ogImage,
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
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

// Vue Query Devtools — dev only, lazy-loaded so it is tree-shaken out of prod.
const VueQueryDevtools = import.meta.dev
  ? defineAsyncComponent(() =>
      import("@tanstack/vue-query-devtools").then((m) => m.VueQueryDevtools),
    )
  : null;
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
      <ClientOnly>
        <component :is="VueQueryDevtools" v-if="VueQueryDevtools" />
      </ClientOnly>
    </v-app>
  </NuxtLayout>
</template>

<style lang="scss">
/* stylelint-disable selector-class-pattern */
.v-application__wrap {
  min-height: 0 !important;
  padding-block-end: 160px !important;
}

/* Reserve the fixed app-bar height during SSR so the content doesn't jump down
   64px once Vuetify measures the layout on hydration. */
.v-main {
  padding-top: 64px !important;
}

/* Cap header content AND page content to the same column so their edges align
   and nothing stretches edge to edge on ultra-wide screens. */
.v-toolbar__content,
.v-main .v-container {
  max-width: 1520px;
  margin-inline: auto;
  width: 100%;
}

/* The landing page fills the viewport and doesn't scroll, so it doesn't need
   the bottom clearance that the scrollable content pages rely on. */
body:has(.overview-container) .v-application__wrap {
  padding-block-end: 0 !important;
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
