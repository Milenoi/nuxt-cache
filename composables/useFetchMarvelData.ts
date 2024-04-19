import type { RouteParamValue } from "vue-router";
import type { QueryObserverResult } from "@tanstack/vue-query";
import { useQuery } from "@tanstack/vue-query";

import type { MarvelResult } from "~/types";

export default async function useFetchMarvelData(
  param?: string | RouteParamValue[],
): Promise<{
  isLoading: Ref<boolean>;
  isPending: Ref<boolean>;
  isFetching: Ref<boolean>;
  isSuccess: Ref<boolean>;
  data: Ref<MarvelResult[] | undefined>;
  refetch: () => Promise<QueryObserverResult<MarvelResult[], Error>>;
}> {
  const url: string = `/api/marvel-characters?ids=${param}`;

  const {
    suspense,
    isLoading,
    isPending,
    isFetching,
    isSuccess,
    data,
    refetch,
  } = useQuery<MarvelResult[]>({
    queryKey: param ? ["marvel", param] : ["marvel"],
    queryFn: async () => {
      try {
        return await $fetch(url);
      } catch (error) {
        const errorMessage = (error as Error).message;

        throw createError({
          statusCode: 404,
          message: errorMessage,
          fatal: true,
        });
      }
    },
    // staleTime: 24 * 60 * 60 * 1000 // 24h
  });

  await suspense();

  return {
    isLoading,
    data,
    isFetching,
    isPending,
    isSuccess,
    refetch,
  };
}
