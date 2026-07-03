import type { QueryObserverResult } from "@tanstack/vue-query";
import { useQuery } from "@tanstack/vue-query";
import { experimental_createQueryPersister } from "@tanstack/query-persist-client-core";
import type { ApodList, ApodSource } from "~/types";

/**
 * Fetch NASA APOD data through the internal cached endpoint.
 *
 * Without a `date` it returns the list (`ApodList`); with a `date` it returns a
 * single entry (`ApodEntry`). Pass the expected shape as the type parameter.
 *
 * Also exposes the cache layers for the UI badges:
 * - `serverSource`: "redis" (server cache) or "nasa" (fresh) — from the payload
 * - `fromClientCache`: true when Vue Query served it from the client cache
 */
export default async function useFetchApod<T = ApodList>(
  date?: string,
): Promise<{
  isLoading: Ref<boolean>;
  isPending: Ref<boolean>;
  isFetching: Ref<boolean>;
  isSuccess: Ref<boolean>;
  data: Ref<T | undefined>;
  serverSource: Ref<ApodSource>;
  fromClientCache: Ref<boolean>;
  refetch: () => Promise<QueryObserverResult<T, Error>>;
}> {
  const url = date ? `/api/apod?date=${date}` : "/api/apod";

  // Shared with the "Clear Redis" button. Read before any await so the Nuxt
  // instance is still in scope.
  const redisCleared = useState("redis-cleared", () => false);
  // Duration of the last real fetch (ms) — a Redis hit is far faster than a
  // fresh NASA round-trip, which makes the cache benefit visible.
  const lastFetchMs = useState<number | null>("last-fetch-ms", () => null);

  const fetchApod = async (): Promise<T> => {
    const start = performance.now();
    try {
      const result = (await $fetch(url)) as T;
      lastFetchMs.value = Math.round(performance.now() - start);
      return result;
    } catch (error) {
      throw createError({
        statusCode: 404,
        message: (error as Error).message,
        fatal: true,
      });
    }
  };

  const {
    data,
    suspense,
    isLoading,
    isPending,
    isFetching,
    isSuccess,
    refetch,
  } = useQuery<T, Error, T>({
    queryKey: date ? ["apod", date] : ["apod"],
    queryFn: fetchApod,
    // Persist to localStorage on the client for instant repeat visits.
    ...(import.meta.client && {
      persister: experimental_createQueryPersister({ storage: localStorage })
        .persisterFn,
    }),
  });

  await suspense();

  // Where the server got it: the Redis flag says whether it was server-cached.
  // Also honours the "Clear Redis" flag (Redis now empty → next fetch is NASA).
  const serverSource = computed<ApodSource>(() => {
    if (redisCleared.value) return "nasa";
    return (data.value as { redis?: string } | undefined)?.redis
      ? "redis"
      : "nasa";
  });
  // Whether the client Vue Query cache currently holds this data. Hidden while a
  // fetch is in flight (the loader shows the source then), and shown again once
  // the refetch has repopulated the cache. Clearing Redis doesn't touch it.
  const fromClientCache = computed(() => !isFetching.value && !!data.value);

  return {
    isLoading,
    isPending,
    isFetching,
    isSuccess,
    data,
    serverSource,
    fromClientCache,
    refetch,
  };
}
