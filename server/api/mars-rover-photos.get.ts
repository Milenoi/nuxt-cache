import {getFormattedCounter, getFormatDate, createHashKeyFromString} from "~/server/utils/helpers";
import getNasaApi from "~/server/utils/getNasaApi";

export default defineEventHandler(async (event) => {
    // Check if the id parameter exists in the URL
    const {id} = getQuery(event);
    const itemId: number = id != null ? +id : 0;

    const hash = createHashKeyFromString(id ? itemId.toString() : 'mars-photo-list');
    const cacheKeyNasa = id ? `mars-photo-detail-${hash}` : `mars-photo-list-${hash}`;

    const cachedNasaData = await useStorage('redis').getItem(cacheKeyNasa);

    if (cachedNasaData) {
        return cachedNasaData
    } else {
        interface MarsPhoto {
            id: number;
            sol: number;
            camera: {
                name: string;
            };
            img_src: string;
            earth_date: string;
            rover: {
                name: string;
                status: string;
                max_sol: number;
                launch_date: string;
                landing_date: string;
                max_date: string;
                total_photos: number;
                cameras: {
                    name: string;
                    full_name: string;
                    total_photos: number;
                }[];
            };
        }

        interface MarsPhotosResponse {
            photos: MarsPhoto[];
        }

        const {photos: rawMarsPhotosData}: MarsPhotosResponse = await $fetch(getNasaApi());

        const modifiedDummyData = rawMarsPhotosData.map((entry, index) => {
            return {
                index: index + 1,
                sol: entry.sol,
                camera: entry.camera,
                img_src: entry.img_src,
                earth_date: getFormatDate(entry.earth_date),
                rover: {
                    name: entry.rover.name,
                    status: entry.rover.status,
                    max_sol: entry.rover.max_sol,
                    max_date: getFormatDate(entry.rover.max_date),
                    total_photos: getFormattedCounter(entry.rover.total_photos),
                }
            }
        })

        /**
         * Retrieves the count of filtered data based on the provided filter.
         *
         * @param {string} filter - the filter to apply to the data
         * @return {number} the count of filtered data
         */
        const getCounter = (filter: string): number => {
            const filteredData = rawMarsPhotosData.filter((entry) => {
                return entry.camera.name === filter
            })

            return filteredData.length
        }


        const firstEntry = rawMarsPhotosData[0];

        const additionalCamerasObjData = firstEntry?.rover?.cameras.map((camera: { name: string }) => {
            return {
                ...camera,
                total_photos: getCounter(camera.name),
            };
        });

        const marsPhotosList = {
            landing_date: getFormatDate(firstEntry?.rover?.launch_date),
            launch_date: getFormatDate(firstEntry?.rover?.landing_date),
            max_date: getFormatDate(firstEntry?.rover?.max_date),
            cameras: additionalCamerasObjData,
            entries: [
                ...modifiedDummyData
            ],
        }

        const marsPhotoDetail = marsPhotosList.entries.find((_, index) => {
            return index + 1 === itemId
        })

        await useStorage('redis').setItem(cacheKeyNasa, {
            ...id ? marsPhotoDetail : marsPhotosList,
            redis: "true"
        }, {
            ttl: 86400 // Defaults to 0
        });
        
        return id ? marsPhotoDetail : marsPhotosList;
    }
});
