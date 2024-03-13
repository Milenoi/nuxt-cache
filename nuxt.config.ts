// https://nuxt.com/docs/api/configuration/nuxt-config

import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    ssr: true,
    runtimeConfig: {
        public: {
            nasaApiKey: '',
            marvelPublicApiKey: '',
            marvelSecretApiKey: '',
            siteName: 'Nuxt Cache',
            siteDescription: 'Nuxt Cache Project',
            language: 'en-US',
        }
    },
    //...
    build: {
        transpile: ['vuetify'],
    },
    devtools: {
        enabled: true
    },
    modules: [
        '@nuxt/image',
        '@hebilicious/vue-query-nuxt',
        (options: any, nuxt: any) => {
            // Ensure options and nuxt are properly typed
            nuxt.hooks.hook('vite:extendConfig', (config: any) => {
                // Ensure config is properly typed
                config.plugins.push(vuetify()); // Assuming vuetify() is a valid Vite plugin
            });
        },
    ],
    vueQuery: {
        // useState key used by nuxt for the vue query state.
        stateKey: "vue-query-nuxt", // default
        // If you only want to import some functions, specify them here.
        // You can pass false or an empty array to disable this feature.
        // default: ["useQuery", "useQueries", "useInfiniteQuery", "useMutation", "useIsFetching", "useIsMutating", "useQueryClient"]
        // autoImports: ["useQuery", "useQueries", "useInfiniteQuery", "useMutation", "useIsFetching", "useIsMutating", "useQueryClient"],
        // Pass the vue query client options here ...
        queryClientOptions: {
            defaultOptions: {

                queries: {
                    staleTime: 24 * 60 * 60 * 1000, // 24h
                    refetchOnWindowFocus: false, // https://tanstack.com/query/latest/docs/framework/vue/guides/window-focus-refetching
                    retry: 2, // https://tanstack.com/query/latest/docs/framework/vue/guides/query-retries (default: 3)
                    // retryDelay: 1000, // https://tanstack.com/query/latest/docs/framework/vue/guides/query-retries

                }
            } // default
        },
        // Pass the vue query plugin options here ....
        vueQueryPluginOptions: {}
    },
    vite: {
        build: {
            cssCodeSplit: true // default
        },
        vue: {
            template: {
                transformAssetUrls,
            },
        },
        css: {
            preprocessorOptions: {
                scss: {}
            }
        }
    },
    nitro: {
        publicAssets: [
            {
                baseURL: 'images',
                dir: 'public/images',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            }
        ],
        compressPublicAssets: {
            gzip: true,
            brotli: true
        },
        prerender: {
            failOnError: false
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
                port: 11456, // Redis port
                host: "redis-11456.c328.europe-west3-1.gce.cloud.redislabs.com", // Redis host
                username: "default", // needs Redis >= 6
                password: process.env.NUXT_REDIS_PASSWORD,
                ttl: 86400 // Defaults to 0
            }
        }
    },
    image: {
        quality: 50,
        domains: ['mars.nasa.gov', 'mars.jpl.nasa.gov', 'https://i.annihil.us/'],
        format: ['avif', 'webp'],
        screens: {
            'xs': 600,
            'sm': 960,
            'md': 1280,
            'lg': 1920,
            'xl': 2400,
        },
    }
})
