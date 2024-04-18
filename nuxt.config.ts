// https://nuxt.com/docs/api/configuration/nuxt-config

import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify'
import imageConfig from "./utils/getImageConfig";

export default defineNuxtConfig({
    ssr: true,
    runtimeConfig: {
        nasaApiKey: '',
        marvelPublicApiKey: '',
        marvelSecretApiKey: '',
        public: {
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
                    refetchOnMount: false,
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
                port: process.env.NUXT_REDIS_PORT,
                host: process.env.NUXT_REDIS_HOST,
                username: process.env.NUXT_REDIS_USERNAME,
                password: process.env.NUXT_REDIS_PASSWORD,
                ttl: 86400 // Defaults to 0
            }
        }
    },
    image: imageConfig
})
