import type { ClearRedisCacheResponse } from "#shared/types";

/**
 * Clear the server-side Redis cache via the POST endpoint.
 * Uses $fetch (not useFetch) because this runs imperatively from a click handler.
 *
 * @return {Promise<ClearRedisCacheResponse>} The API response.
 */
export default function useClearRedisCache(): Promise<ClearRedisCacheResponse> {
  return $fetch<ClearRedisCacheResponse>("/api/clear-redis-cache", {
    method: "POST",
  });
}
