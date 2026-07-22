import type { ClearRedisCacheResponse } from "#shared/types";

/**
 * Clear the server-side Nitro SWR cache via the POST endpoint.
 * Uses $fetch (not useFetch) because this runs imperatively from a click handler.
 *
 * @return {Promise<ClearRedisCacheResponse>} The API response.
 */
export default function useClearNitroCache(): Promise<ClearRedisCacheResponse> {
  return $fetch<ClearRedisCacheResponse>("/api/clear-nitro-cache", {
    method: "POST",
  });
}
