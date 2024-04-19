import type { RouteParamValue } from "vue-router";
import type { QueryObserverResult } from "@tanstack/vue-query";
import { useQuery } from "@tanstack/vue-query";

interface MarvelListData {
  attributionText: string;
  results: MarvelCharacter[];
}

interface MarvelCharacter {
  id: number;
  name: string;
  modified: string;
  description: string;
  thumbnail: {
    path: string;
    extension: string;
  };
  events: {
    available: string;
  };
  stories: {
    available: string;
  };
  comics: {
    available: string;
  };
  series: {
    available: string;
  };
}

type MarvelData = MarvelListData | MarvelCharacter;

interface QueryOptions<TData> {
  queryKey: [string, string | string[]] | [string];
  queryFn: () => Promise<TData>;
}

export default async function useFetchMarvelData(
  param?: string | RouteParamValue[],
): Promise<{
  isLoading: Ref<boolean>;
  isPending: Ref<boolean>;
  isFetching: Ref<boolean>;
  isSuccess: Ref<boolean>;
  data: Ref<MarvelData[] | undefined>;
  refetch: () => Promise<QueryObserverResult<MarvelData[], Error>>;
}> {
  const url: string = `/api/marvel-characters?ids=${param}`;

  const options: QueryOptions<MarvelData[]> = {
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
  };

  const {
    suspense,
    isLoading,
    isPending,
    isFetching,
    isSuccess,
    data,
    refetch,
  } = useQuery<MarvelData[]>(options);

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
