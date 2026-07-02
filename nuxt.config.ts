// https://nuxt.com/docs/api/configuration/nuxt-config

import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import imageConfig from "./utils/getImageConfig";

export default defineNuxtConfig({
  ssr: true,

  runtimeConfig: {
    nasaApiKey: "",
    public: {
      siteName: "Nuxt Cache",
      siteDescription: "Nuxt Cache Project",
      language: "en-US",
    },
  },

  //...
  build: {
    transpile: ["vuetify"],
  },

  devtools: {
    enabled: true,
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    (options, nuxt) => {
      // Ensure options and nuxt are properly typed
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // Ensure config is properly typed
        config?.plugins?.push(vuetify()); // Assuming vuetify() is a valid Vite plugin
      });
    },
  ],

  vite: {
    build: {
      cssCodeSplit: true, // default
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
    // Pre-bundle these so dev doesn't reload on first discovery.
    optimizeDeps: {
      include: [
        "@tanstack/vue-query",
        "@vue/devtools-core",
        "@vue/devtools-kit",
      ],
    },
  },

  routeRules: {
    // Static pages: let the CDN cache and revalidate them in the background.
    // APOD routes stay SSR so the Redis/NASA cache indicator is always live.
    "/": {
      headers: {
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
    "/about": {
      headers: {
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  },

  nitro: {
    publicAssets: [
      {
        baseURL: "images",
        dir: "public/images",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    ],
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    prerender: {
      failOnError: false,
      // crawlLinks: true
    },
    storage: {
      /* redis: {
                             driver: 'redis',
                             /!* redis connector options *!/
                             port: 6379, // Redis port
                             host: "localhost", // Redis host
                             username: "", // needs Redis >= 6
                             password: "",
                             db: 0,
                             ttl: 86400 // Defaults to 0
                         },*/
      redis: {
        driver: "redis",
        /* redis connector options */
        port: process.env.NUXT_REDIS_PORT,
        host: process.env.NUXT_REDIS_HOST,
        username: process.env.NUXT_REDIS_USERNAME,
        password: process.env.NUXT_REDIS_PASSWORD,
        ttl: 86400, // Defaults to 0
      },
    },
  },

  image: imageConfig,
  compatibilityDate: "2025-01-20",
});