export interface ClearRedisCacheResponse {
  status: number;
  message: string;
  error?: string;
}

export default async function useClearRedisCache(): Promise<ClearRedisCacheResponse> {
  return useFetch("/api/clear-redis-cache");
}
