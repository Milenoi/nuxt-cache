import type { DehydratedState } from "@tanstack/vue-query";
import {
  QueryClient,
  VueQueryPlugin,
  dehydrate,
  hydrate,
} from "@tanstack/vue-query";

// Replaces the unmaintained @hebilicious/vue-query-nuxt wrapper.
// Sets up TanStack Vue Query with SSR-safe state transfer:
// the server dehydrates the query cache into the Nuxt payload, and the
// client hydrates from it so there is no duplicate fetch after hydration.
export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>("vue-query");

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 24 * 60 * 60 * 1000, // 24h
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  });

  nuxt.vueApp.use(VueQueryPlugin, { queryClient });

  if (import.meta.server) {
    nuxt.hooks.hook("app:rendered", () => {
      vueQueryState.value = dehydrate(queryClient);
    });
  }

  if (import.meta.client) {
    hydrate(queryClient, vueQueryState.value);
  }
});
