import type {RouteParamValue} from "vue-router";
import {useQuery} from '@tanstack/vue-query'

export default async function useFetchMarvelData(param?: string | RouteParamValue[]): Promise<any> {
    const url = `/api/marvel-characters?ids=${param}`;

    const {
        isPending,
        isFetching,
        data,
        suspense,
        refetch,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: param ? ['marvel-character', param] : ['marvel-character-list'],
        queryFn: async () => {
            try {
                return await $fetch(url)
            } catch (error) {
                const errorMessage = (error as Error).message;

                throw createError({
                    statusCode: 404,
                    message: errorMessage,
                    fatal: true
                })
            }
        },
        // staleTime: 24 * 60 * 60 * 1000 // 24h
    })

    await suspense();

    return {
        isLoading,
        data,
        isFetching,
        isPending,
        refetch
    }
}
