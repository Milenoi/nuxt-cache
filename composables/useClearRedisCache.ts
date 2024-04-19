import type { ClearRedisCacheResponse } from "~/types";

/**
 * A function that asynchronously clears the Redis cache by making a fetch request to the specified API endpoint.
 *
 * @return {Promise<ClearRedisCacheResponse>} The response from the API call to clear the Redis cache.
 */
export default async function useClearRedisCache(): Promise<ClearRedisCacheResponse> {
  const { data } = await useFetch<ClearRedisCacheResponse>(
    "/api/clear-redis-cache",
  );

  return data.value as ClearRedisCacheResponse;
}
