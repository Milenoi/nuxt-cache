import {
  getFormatDate,
  getFormattedCounter,
  createHashKeyFromString,
} from "~/server/utils/helpers";
import getMarvelApi from "~/server/utils/getMarvelApi";
import type { MarvelData, MarvelResponse, MarvelCharacter } from "~/types";

export default defineEventHandler(async (event): Promise<MarvelData> => {
  // Check if the id parameter exists in the URL
  const ids = getQuery(event)?.ids;

  // If ids is null, undefined, or not a string, set it to an empty string
  const idsString: string = typeof ids === "string" ? ids : "";

  // Split the string by commas after trimming
  const idsArray: string[] = idsString.trim().split(",");

  // Compute the cache key
  const isDetailPage = idsArray.length === 1;

  const hash = createHashKeyFromString(idsString);

  const cacheKeyMarvel = isDetailPage
    ? `marvel-detail-${hash}`
    : `marvel-list-${hash}`;

  const cachedMarvelData =
    await useStorage("redis").getItem<MarvelData>(cacheKeyMarvel);

  if (cachedMarvelData) {
    return cachedMarvelData;
  } else {
    // Create an array of promises for each fetch operation
    const fetchPromises = idsArray.map(async (id: string) => {
      try {
        // Perform the fetch operation
        const response: MarvelResponse = await $fetch(getMarvelApi(id));

        // Extract data and attributionText from the response
        const { data, attributionText } = response;

        // Process the fetched data here or return it if needed
        return { data, attributionText };
      } catch (error) {
        // Handle fetch errors
        console.error("Error fetching data:", error);

        // You might want to return some default values or handle the error differently
        return { data: null, attributionText: "" };
      }
    });

    // Wait for all fetch operations to complete
    const allData = await Promise.all(fetchPromises);

    // Extract the attributionText
    const attributionText = allData[0].attributionText;

    // Assuming results is the array containing the fetched data
    const mergedResults = allData.reduce<MarvelCharacter[]>(
      (accumulator: MarvelCharacter[], currentValue, _) => {
        // Merge the results array
        if (currentValue.data && currentValue.data.results) {
          accumulator.push({
            id: currentValue.data.results[0].id,
            name: currentValue.data.results[0].name,
            modified: getFormatDate(currentValue.data.results[0].modified),
            description: currentValue.data.results[0].description,
            thumbnail: currentValue.data.results[0].thumbnail,
            events: {
              available: getFormattedCounter(
                currentValue.data.results[0].events.available,
              ),
            },
            stories: {
              available: getFormattedCounter(
                currentValue.data.results[0].stories.available,
              ),
            },
            comics: {
              available: getFormattedCounter(
                currentValue.data.results[0].comics.available,
              ),
            },
            series: {
              available: getFormattedCounter(
                currentValue.data.results[0].series.available,
              ),
            },
          });
        }

        // Sort alphabetically by name and return the merged data
        return accumulator.sort((a, b) => {
          const nameA = a.name.toUpperCase();
          const nameB = b.name.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
      },
      [],
    );

    // Construct the final object
    const data: MarvelData = {
      attributionText,
      results: mergedResults,
    };

    await useStorage("redis").setItem(
      cacheKeyMarvel,
      { ...data, redis: "true" },
      {
        ttl: 86400, // Defaults to 0
      },
    );

    return data;
  }
});
