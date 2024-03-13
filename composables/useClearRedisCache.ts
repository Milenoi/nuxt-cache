export default async function useClearRedisCache(): Promise<any> {
    return useFetch('/api/clear-redis-cache');
}
