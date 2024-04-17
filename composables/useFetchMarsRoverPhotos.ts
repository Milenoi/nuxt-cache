import type {RouteParamValue} from "vue-router";
import {useQuery} from '@tanstack/vue-query'

export default async function fetchMarsRoverPhotos(param?: string | RouteParamValue[]): Promise<any> {
    const url = param ? `/api/mars-rover-photos?id=${param}` : '/api/mars-rover-photos';

    const getMarsRoverPhotos = async () => {
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
    }

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


    const {
        data,
        suspense,
        isSuccess,
        isLoading,
        isPending,
        isFetching,
        refetch
    } = useQuery({
        queryKey: param ? ['mars-rover', param] : ['mars-rover'],
        queryFn: getMarsRoverPhotos,
        // placeholderData: placeholderList,
        // staleTime: 24 * 60 * 60 * 1000 // 24h
        // enabled: false,
    })

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
        refetch
    }
}
