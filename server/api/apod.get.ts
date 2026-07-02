import { getFormatDate } from "~/server/utils/helpers";
import getApodApi from "~/server/utils/getApodApi";
import type { ApodApiEntry, ApodEntry, ApodList, ApodMediaType } from "~/types";

const RANGE_DAYS = 14;
const CACHE_TTL = 86400; // 24h
const DAY_MS = 24 * 60 * 60 * 1000;

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const toMediaType = (raw: string): ApodMediaType => {
  if (raw === "image") return "image";
  if (raw === "video") return "video";
  return "other";
};

/**
 * Normalize a raw APOD API entry into the shape the UI consumes.
 */
const normalizeEntry = (raw: ApodApiEntry): ApodEntry => ({
  date: raw.date,
  title: raw.title,
  explanation: raw.explanation,
  mediaType: toMediaType(raw.media_type),
  url: raw.url,
  hdurl: raw.hdurl ?? null,
  thumbnailUrl: raw.thumbnail_url || null,
  // NASA sometimes embeds line breaks in the copyright field.
  copyright: raw.copyright?.replace(/\s+/g, " ").trim() || null,
  formattedDate: getFormatDate(raw.date),
});

/**
 * Fetch from NASA, translating any upstream failure into a clean HTTP error.
 * We never cache a failed response, so a transient NASA outage can't poison
 * the cache.
 */
const fetchFromNasa = async <T>(url: string): Promise<T> => {
  try {
    return await $fetch<T>(url);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 502;
    throw createError({
      statusCode: status,
      statusMessage: "Failed to fetch data from the NASA APOD API.",
    });
  }
};

export default defineEventHandler(
  async (event): Promise<ApodList | ApodEntry> => {
    const { date } = getQuery(event);
    const dateParam = typeof date === "string" && date.length > 0 ? date : null;
    const storage = useStorage("redis");

    // ---- Detail: a single day, keyed by date ----
    if (dateParam) {
      const cacheKey = `apod:detail:${dateParam}`;

      // The list pre-caches every entry, so most detail views are cache hits
      // and never touch the NASA API.
      const cached = await storage.getItem<ApodEntry>(cacheKey);
      if (cached) return cached;

      const raw = await fetchFromNasa<ApodApiEntry>(
        getApodApi({ date: dateParam }),
      );
      const entry = normalizeEntry(raw);

      await storage.setItem(cacheKey, { ...entry, redis: "true" }, {
        ttl: CACHE_TTL,
      });

      return entry;
    }

    // ---- List: the last RANGE_DAYS days, ending yesterday ----
    // (today's picture may not be published yet, which would 400 the range).
    const endDate = new Date(Date.now() - DAY_MS);
    const startDate = new Date(endDate.getTime() - (RANGE_DAYS - 1) * DAY_MS);
    const start = toIsoDate(startDate);
    const end = toIsoDate(endDate);

    const cacheKey = `apod:list:${start}_${end}`;

    const cached = await storage.getItem<ApodList>(cacheKey);
    if (cached) return cached;

    const raw = await fetchFromNasa<ApodApiEntry[]>(
      getApodApi({ startDate: start, endDate: end }),
    );

    const entries = raw
      .map(normalizeEntry)
      .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

    const list: ApodList = { entries };

    // Cache the list plus every entry individually, so opening any detail page
    // is a cache hit instead of another NASA request.
    await storage.setItem(cacheKey, { ...list, redis: "true" }, {
      ttl: CACHE_TTL,
    });
    await Promise.all(
      entries.map((entry) =>
        storage.setItem(
          `apod:detail:${entry.date}`,
          { ...entry, redis: "true" },
          { ttl: CACHE_TTL },
        ),
      ),
    );

    return list;
  },
);
