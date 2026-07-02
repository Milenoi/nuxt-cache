import type { QueryObserverResult } from "@tanstack/vue-query";
import { useQuery } from "@tanstack/vue-query";
import { experimental_createPersister } from "@tanstack/query-persist-client-core";
import type { ApodList } from "~/types";

/**
 * Fetch NASA APOD data through the internal cached endpoint.
 *
 * Without a `date` it returns the list (`ApodList`); with a `date` it returns a
 * single entry (`ApodEntry`). Pass the expected shape as the type parameter.
 */
export default async function useFetchApod<T = ApodList>(
  date?: string,
): Promise<{
  isLoading: Ref<boolean>;
  isPending: Ref<boolean>;
  isFetching: Ref<boolean>;
  isSuccess: Ref<boolean>;
  data: Ref<T | undefined>;
  refetch: () => Promise<QueryObserverResult<T, Error>>;
}> {
  const url = date ? `/api/apod?date=${date}` : "/api/apod";

  const fetchApod = async (): Promise<T> => {
    try {
      return await $fetch<T>(url);
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
      persister: experimental_createPersister({ storage: localStorage }),
    }),
  });

  await suspense();

  return { isLoading, isPending, isFetching, isSuccess, data, refetch };
}
