import probe from "probe-image-size";

/**
 * Read an image's intrinsic width/height by streaming only its header bytes
 * (not the full file). Used to store the aspect ratio in the cache so the detail
 * page can reserve the exact box before the image loads (avoids layout shift).
 * Returns null on any failure — a missing size just falls back to no reservation,
 * never breaks the response.
 */
export const getImageSize = async (
  url: string,
): Promise<{ width: number; height: number } | null> => {
  try {
    const { width, height } = await probe(url);
    if (!width || !height) return null;
    return { width, height };
  } catch {
    return null;
  }
};
