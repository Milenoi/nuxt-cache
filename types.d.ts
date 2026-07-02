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
    /** Present only when the payload was served from the Redis cache. */
    redis?: string;
}

export interface ApodList {
    entries: ApodEntry[];
    redis?: string;
}

export interface ApodEmbed {
    type: "youtube" | "vimeo" | "file" | "external";
    src: string;
}

