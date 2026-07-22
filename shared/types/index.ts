export interface ClearRedisCacheResponse {
    status: number;
    message: string;
    error?: string;
}

// ---- NASA APOD (Astronomy Picture of the Day) ----

export interface ApodQueryParams {
    date?: string;
    startDate?: string;
    endDate?: string;
}

export type ApodMediaType = "image" | "video" | "other";

/**
 * Which layer of the cache chain served a response, from origin outward:
 * NASA (origin) -> Redis (persistent) -> Nitro (SWR front). Vue Query (client)
 * sits in front of all of these and is tracked separately.
 */
export type ApodSource = "nasa" | "redis" | "nitro";

/** Normalized entry consumed by the UI. */
export interface ApodEntry {
    date: string;
    title: string;
    explanation: string;
    mediaType: ApodMediaType;
    url: string;
    hdurl: string | null;
    thumbnailUrl: string | null;
    copyright: string | null;
    formattedDate: string;
    /** Intrinsic image dimensions, probed server-side so the UI can reserve the
     *  exact aspect ratio and avoid layout shift. Null for videos/other or when
     *  probing failed. */
    width: number | null;
    height: number | null;
    /** Where this response came from — set fresh by the server on every request. */
    _source?: ApodSource;
}

export interface ApodList {
    entries: ApodEntry[];
    _source?: ApodSource;
}

export interface ApodEmbed {
    type: "youtube" | "vimeo" | "file" | "external";
    src: string;
}

