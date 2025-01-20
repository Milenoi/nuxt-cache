import {
    getFormatDate,
    createHashKeyFromString,
} from "~/server/utils/helpers";

import getNasaApi from "~/server/utils/getNasaApi";
import type {MarsPhoto, MarsPhotosList, MarsPhotosResponse} from "~/types";

export default defineEventHandler(
    async (event): Promise<MarsPhoto | undefined | MarsPhotosList> => {
        // Check if the id parameter exists in the URL
        const {id} = getQuery(event);
        const itemId: number = id != null ? +id : 0;

        const hash = createHashKeyFromString(
            id ? itemId.toString() : "mars-photo-list",
        );
        const cacheKeyNasa = id
            ? `mars-photo-detail-${hash}`
            : `mars-photo-list-${hash}`;

        const cachedNasaData = await useStorage("redis").getItem(cacheKeyNasa);

        /**/
        if (cachedNasaData) {
            return cachedNasaData as MarsPhotosList | MarsPhoto;
        } else {
            const {photos: rawMarsPhotosData}: MarsPhotosResponse =
                await $fetch(getNasaApi());

            const modifiedData: MarsPhoto[] = rawMarsPhotosData.map(
                (entry, index) => {
                    return {
                        index: index + 1,
                        sol: entry.sol,
                        camera: entry.camera,
                        img_src: entry.img_src,
                        earth_date: getFormatDate(entry.earth_date),
                        rover: {
                            name: entry.rover.name,
                            status: entry.rover.status,
                        },
                    }
                }
            );

            const firstEntry = rawMarsPhotosData[0];

            // Define the type of the accumulator
            const photoCounts = modifiedData.reduce<Record<string, number>>((acc, item) => {
                const cameraName = item.camera.name;

                acc[cameraName] = (acc[cameraName] || 0) + 1;
                return acc;
            }, {});

            // Count total photos for each camera
            const cameras = modifiedData.reduce((acc: Array<{
                name: string;
                total_photos: number
            }> = [], item: MarsPhoto) => {
                const cameraName = item.camera.name;

                if (!acc.some(camera => camera.name === cameraName)) {
                    acc.push({
                        name: cameraName,
                        total_photos: photoCounts[cameraName],
                    });
                }
                return acc;
            }, []);


            const marsPhotosList = {
                landing_date: getFormatDate(firstEntry?.rover?.launch_date),
                launch_date: getFormatDate(firstEntry?.rover?.landing_date),
                cameras,
                entries: [...modifiedData],
            };

            const marsPhotoDetail = marsPhotosList.entries.find((_, index) => {
                return index + 1 === itemId;
            });

            await useStorage("redis").setItem(
                cacheKeyNasa,
                {
                    ...(id ? marsPhotoDetail : marsPhotosList),
                    redis: "true",
                },
                {
                    ttl: 86400, // Defaults to 0
                },
            );

            return id
                ? (marsPhotoDetail as MarsPhoto | undefined)
                : (marsPhotosList as MarsPhotosList | undefined);
        }
    },
);
