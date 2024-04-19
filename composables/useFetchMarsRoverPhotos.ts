import type { RouteParamValue } from "vue-router";
import type { QueryObserverResult } from "@tanstack/vue-query";
import { useQuery } from "@tanstack/vue-query";
import { experimental_createPersister } from "@tanstack/query-persist-client-core";
import type { MarsRoverPhoto } from "~/types";

export default async function fetchMarsRoverPhotos(
  param?: string | RouteParamValue[],
): Promise<{
  isLoading: Ref<boolean>;
  isPending: Ref<boolean>;
  isFetching: Ref<boolean>;
  isSuccess: Ref<boolean>;
  data: Ref<MarsRoverPhoto[] | undefined>;
  refetch: () => Promise<QueryObserverResult<MarsRoverPhoto[], Error>>;
}> {
  const url: string = param
    ? `/api/mars-rover-photos?id=${param}`
    : "/api/mars-rover-photos";

  /**
   * Retrieves Mars Rover photos from the specified URL.
   *
   * @return {Promise<any>} The response from the API call.
   */
  const getMarsRoverPhotos = async (): Promise<MarsRoverPhoto[]> => {
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
  };

  /*
        const placeholderItem = {
            id: '',
            imageUrl: 'placeholder_image_url',
            title: 'Placeholder Title',
            description: 'Placeholder Description'
        };


        const placeholderList = Array.from({length: 10}, (_, index) => ({
            ...placeholderItem,
            id: `placeholder_${index}` // Unique placeholder ID
        }));
        */

  const options = {
    queryKey: param ? ["mars-rover", param] : ["mars-rover"],
    queryFn: getMarsRoverPhotos,
    // Only include persister option on the client-side
    ...(import.meta.client && {
      persister: experimental_createPersister({
        storage: localStorage,
      }),
    }),
    //staleTime: 24 * 60 * 60 * 1000 // 24h
    // placeholderData: placeholderList,
    // enabled: false,
  };

  const {
    data,
    suspense,
    isLoading,
    isPending,
    isFetching,
    isSuccess,
    refetch,
  } = useQuery<MarsRoverPhoto[], Error, MarsRoverPhoto[]>(options);

  /*
          // After a delay, trigger suspense and fetch actual data
          setTimeout(async () => {

          }, 200000); // Adjust the delay time as needed (2000 milliseconds = 2 seconds)
          */

  await suspense(); // Wait for suspense

  return {
    isLoading,
    isPending,
    isFetching,
    isSuccess,
    data,
    refetch,
  };
}
