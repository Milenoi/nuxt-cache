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

// ---- Site content (the static UI copy, served through the cache chain) ----

/**
 * Which layer of the cache chain served the site content, from origin outward:
 * the bundled JSON (origin) -> Redis (persistent) -> Nitro (SWR front). Mirrors
 * {@link ApodSource}, but the origin here is the app's own content file rather
 * than NASA.
 */
export type ContentSource = "origin" | "redis" | "nitro";

export interface AboutTechRow {
    label: string;
    value: string;
}

/** The `about` section of the static content, consumed by the About page. */
export interface AboutContent {
    tagline: string;
    heading: string;
    lead1: string;
    lead2: string;
    techStackLabel: string;
    techStack: AboutTechRow[];
    cta: string;
    creditText: string;
    creditSep: string;
    creditLinkLabel: string;
    creditUrl: string;
    /** Cross-link to the sibling RAG demo (mirrors the link back on that site). */
    siblingText: string;
    siblingLinkLabel: string;
    siblingUrl: string;
    siblingSuffix: string;
}

/**
 * The site content payload returned by `/api/content`. Only the sections that
 * are actually consumed via the API are typed precisely; the rest of the JSON is
 * covered by the index signature until it, too, is migrated onto the API.
 */
export interface SiteContent {
    about: AboutContent;
    /** Where this response came from — set fresh by the server on every request. */
    _source?: ContentSource;
    [key: string]: unknown;
}

