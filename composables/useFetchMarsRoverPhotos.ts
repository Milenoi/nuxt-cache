import type { RouteParamValue } from "vue-router";
import type { QueryObserverResult } from "@tanstack/vue-query";
import { useQuery } from "@tanstack/vue-query";

interface MarsRoverPhoto {
  // Properties for single photo
  index?: number;
  sol?: number;
  camera?: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src?: string;
  earth_date?: string;
  rover?: {
    name: string;
    status: string;
    max_sol: number;
    max_date: string;
    total_photos: string;
  };

  // Properties for photo list
  landing_date?: string;
  launch_date?: string;
  max_date?: string;
  cameras?: {
    name: string;
    full_name: string;
    total_photos: number;
  }[];
  entries?: {
    index: number;
    sol: number;
    camera: {
      id: number;
      name: string;
      rover_id: number;
      full_name: string;
    };
    img_src: string;
    earth_date: string;
    rover: {
      name: string;
      status: string;
      max_sol: number;
      max_date: string;
      total_photos: string;
    };
  }[];
}

interface QueryOptions<TData> {
  queryKey: [string, string | string[]] | [string];
  queryFn: () => Promise<TData>;
}

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

  const options: QueryOptions<MarsRoverPhoto[]> = {
    queryKey: param ? ["mars-rover", param] : ["mars-rover"],
    queryFn: getMarsRoverPhotos,
    // placeholderData: placeholderList,
    // staleTime: 24 * 60 * 60 * 1000 // 24h
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
  } = useQuery<MarsRoverPhoto[]>(options);

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
