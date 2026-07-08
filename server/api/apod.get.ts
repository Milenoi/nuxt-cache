import type { ZodType } from "zod";
import { getFormatDate } from "~/server/utils/helpers";
import getApodApi from "~/server/utils/getApodApi";
import {
  ApodApiEntrySchema,
  ApodApiListSchema,
  type ApodApiEntry,
} from "~/server/utils/apodSchema";
import type { ApodEntry, ApodList, ApodMediaType } from "~/types";

const RANGE_DAYS = 60;
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
const fetchFromNasa = async <T>(
  url: string,
  schema: ZodType<T>,
): Promise<T> => {
  try {
    // Validate the upstream shape; a mismatch throws instead of silently
    // trusting bad data (types stay honest).
    return schema.parse(await $fetch(url));
  } catch (error) {
    const status = (error as { status?: number }).status ?? 502;
    throw createError({
      statusCode: status,
      statusMessage: "Failed to fetch or validate data from the NASA APOD API.",
    });
  }
};

export default defineEventHandler(
  async (event): Promise<ApodList | ApodEntry> => {
    const { date } = getQuery(event);
    const dateParam = typeof date === "string" && date.length > 0 ? date : null;

    // Reject malformed dates up front: a failed NASA response is never cached, so
    // an invalid `?date=` would otherwise hit the rate-limited API on every call.
    if (dateParam && !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      throw createError({ statusCode: 400, statusMessage: "Invalid date." });
    }

    const storage = useStorage("redis");

    // ---- Detail: a single day, keyed by date ----
    if (dateParam) {
      const cacheKey = `apod:detail:${dateParam}`;

      // The list pre-caches every entry, so most detail views are cache hits
      // and never touch the NASA API.
      const cached = await storage.getItem<ApodEntry>(cacheKey);
      if (cached) return cached;

      const raw = await fetchFromNasa(
        getApodApi({ date: dateParam }),
        ApodApiEntrySchema,
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

    const raw = await fetchFromNasa(
      getApodApi({ startDate: start, endDate: end }),
      ApodApiListSchema,
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
