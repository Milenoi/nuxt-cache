import { z } from "zod";

// Source of truth for the raw NASA APOD response. The TS type is inferred from
// the schema, so it can never drift from what we actually validate at runtime.
export const ApodApiEntrySchema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  media_type: z.string(),
  url: z.string(),
  hdurl: z.string().optional(),
  thumbnail_url: z.string().optional(),
  copyright: z.string().optional(),
  service_version: z.string().optional(),
});

export const ApodApiListSchema = z.array(ApodApiEntrySchema);

export type ApodApiEntry = z.infer<typeof ApodApiEntrySchema>;
