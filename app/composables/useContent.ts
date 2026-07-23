import type { QueryObserverResult } from "@tanstack/vue-query";
import { useQuery } from "@tanstack/vue-query";
import { experimental_createQueryPersister } from "@tanstack/query-persist-client-core";
import type { ContentSource, SiteContent } from "#shared/types";

/**
 * Fetch the static site content through the internal cached `/api/content`
 * endpoint (Vue Query -> Nitro SWR -> Redis -> bundled JSON). The composable
 * mirrors {@link useFetchApod}: it `await suspense()`s so the content is ready
 * for SSR and persists to `localStorage` on the client.
 *
 * - `serverSource`: which server layer produced the last response ("origin" /
 *   "redis" / "nitro"), read straight from the payload's `_source`.
 * - `fromClientCache`: true when Vue Query holds this content on the client.
 */
export default async function useContent(): Promise<{
  data: Ref<SiteContent | undefined>;
  serverSource: Ref<ContentSource>;
  fromClientCache: Ref<boolean>;
  isLoading: Ref<boolean>;
  isFetching: Ref<boolean>;
  isSuccess: Ref<boolean>;
  refetch: () => Promise<QueryObserverResult<SiteContent, Error>>;
}> {
  const fetchContent = async (): Promise<SiteContent> =>
    // Cast around the typed-route overloads (they recurse: "excessive stack depth").
    ($fetch as (u: string) => Promise<SiteContent>)("/api/content");

  const { data, suspense, isLoading, isFetching, isSuccess, refetch } = useQuery<
    SiteContent,
    Error,
    SiteContent
  >({
    queryKey: ["content"],
    queryFn: fetchContent,
    // Persist to localStorage on the client for instant repeat visits.
    ...(import.meta.client && {
      persister: experimental_createQueryPersister({ storage: localStorage })
        .persisterFn,
    }),
  });

  await suspense();

  const serverSource = computed<ContentSource>(
    () => data.value?._source ?? "origin",
  );

  // Whether the client Vue Query cache currently holds this content. Hidden
  // while a fetch is in flight, shown again once the cache is repopulated.
  const fromClientCache = computed(() => !isFetching.value && !!data.value);

  return {
    data,
    serverSource,
    fromClientCache,
    isLoading,
    isFetching,
    isSuccess,
    refetch,
  };
}
