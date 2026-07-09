import type { ZodType } from "zod";
import { getFormatDate } from "~/server/utils/helpers";
import getApodApi from "~/server/utils/getApodApi";
import {
  ApodApiEntrySchema,
  ApodApiListSchema,
  type ApodApiEntry,
} from "~/server/utils/apodSchema";
import type { ApodEntry, ApodList, ApodMediaType, ApodSource } from "~/types";

const RANGE_DAYS = 60;
const CACHE_TTL = 86400; // 24h
const DAY_MS = 24 * 60 * 60 * 1000;

// Nitro SWR layer (the front server cache): keep data "fresh" only briefly so the
// stale-while-revalidate behaviour is observable, then serve stale up to a day.
const NITRO_MAX_AGE = 30; // seconds a value is considered fresh
const NITRO_STALE_MAX_AGE = CACHE_TTL; // seconds a stale value may still be served

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

/** The list window: the last RANGE_DAYS days, ending yesterday. */
const listRange = () => {
  // (today's picture may not be published yet, which would 400 the range).
  const endDate = new Date(Date.now() - DAY_MS);
  const startDate = new Date(endDate.getTime() - (RANGE_DAYS - 1) * DAY_MS);
  return { start: toIsoDate(startDate), end: toIsoDate(endDate) };
};

// ---- Pure upstream fetchers (no caching) ----

const fetchDetail = async (date: string): Promise<ApodEntry> =>
  normalizeEntry(await fetchFromNasa(getApodApi({ date }), ApodApiEntrySchema));

const fetchList = async (): Promise<ApodEntry[]> => {
  const { start, end } = listRange();
  const raw = await fetchFromNasa(
    getApodApi({ startDate: start, endDate: end }),
    ApodApiListSchema,
  );
  return raw.map(normalizeEntry).sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
};

/*
 * The cache CHAIN. Every request flows through the layers in order and each layer
 * only asks the next one when it is empty, filling itself on the way back:
 *
 *   Vue Query (client) -> Nitro SWR (server) -> Redis (server) -> NASA (origin)
 *
 * The server owns the last three. Nitro sits in front (fast, stale-while-
 * revalidate); Redis is the persistent backing store; NASA is the origin. The
 * `_source` we attach tells the UI which layer actually served this response.
 */

// Detail: a single day, keyed by date.
const loadDetail = async (date: string): Promise<ApodEntry> => {
  // Assume the Nitro layer served it; the inner fn only runs on a Nitro miss and
  // then reports whether Redis or NASA produced the data.
  let servedBy: ApodSource = "nitro";

  // Inner layers (Redis -> NASA), wrapped by Nitro below.
  const throughRedis = async (d: string): Promise<ApodEntry> => {
    const storage = useStorage("redis");
    const cacheKey = `apod:detail:${d}`;

    const cached = await storage.getItem<ApodEntry>(cacheKey);
    if (cached) {
      servedBy = "redis";
      return cached;
    }

    servedBy = "nasa";
    const entry = await fetchDetail(d);
    await storage.setItem(cacheKey, entry, { ttl: CACHE_TTL });
    return entry;
  };

  const throughNitro = defineCachedFunction(throughRedis, {
    name: "apod-detail",
    group: "apod-nitro",
    getKey: (d: string) => d,
    maxAge: NITRO_MAX_AGE,
    staleMaxAge: NITRO_STALE_MAX_AGE,
    swr: true,
  });

  const entry = await throughNitro(date);
  return { ...entry, _source: servedBy };
};

// List: the last RANGE_DAYS days.
const loadList = async (): Promise<ApodList> => {
  const { start, end } = listRange();
  let servedBy: ApodSource = "nitro";

  const throughRedis = async (): Promise<ApodList> => {
    const storage = useStorage("redis");
    const cacheKey = `apod:list:${start}_${end}`;

    const cached = await storage.getItem<ApodList>(cacheKey);
    if (cached) {
      servedBy = "redis";
      return cached;
    }

    servedBy = "nasa";
    const entries = await fetchList();
    const list: ApodList = { entries };

    // Cache the list plus every entry individually, so opening any detail page
    // is a Redis hit instead of another NASA request.
    await storage.setItem(cacheKey, list, { ttl: CACHE_TTL });
    await Promise.all(
      entries.map((entry) =>
        storage.setItem(`apod:detail:${entry.date}`, entry, { ttl: CACHE_TTL }),
      ),
    );

    return list;
  };

  const throughNitro = defineCachedFunction(throughRedis, {
    name: "apod-list",
    group: "apod-nitro",
    getKey: () => `${start}_${end}`,
    maxAge: NITRO_MAX_AGE,
    staleMaxAge: NITRO_STALE_MAX_AGE,
    swr: true,
  });

  const list = await throughNitro();
  return { ...list, _source: servedBy };
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

    return dateParam ? loadDetail(dateParam) : loadList();
  },
);
