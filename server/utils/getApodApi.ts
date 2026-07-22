import type { ApodQueryParams } from "#shared/types";

const APOD_BASE = "https://api.nasa.gov/planetary/apod";

/**
 * Build the NASA APOD (Astronomy Picture of the Day) request URL.
 *
 * Pass `date` for a single day (detail view) or `startDate`/`endDate` for a
 * range (list view). `thumbs=true` makes the API return a thumbnail_url for
 * video entries.
 *
 * @param {ApodQueryParams} params - date or date range to request
 * @return {string} the fully qualified APOD API URL
 */
const getApodApi = (params: ApodQueryParams = {}): string => {
  const config = useRuntimeConfig();

  const search = new URLSearchParams({
    api_key: config.nasaApiKey,
    thumbs: "true",
  });

  if (params.date) search.set("date", params.date);
  if (params.startDate) search.set("start_date", params.startDate);
  if (params.endDate) search.set("end_date", params.endDate);

  return `${APOD_BASE}?${search.toString()}`;
};

export default getApodApi;
