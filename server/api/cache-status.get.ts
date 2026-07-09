// Reports whether each SERVER cache layer currently holds any APOD data, so the
// UI can show a live full/empty indicator per layer. (The client Vue Query layer
// is tracked in the browser.)
export default defineEventHandler(async () => {
  const redisKeys = await useStorage("redis").getKeys("apod");
  const nitroKeys = await useStorage("cache").getKeys("apod-nitro");

  return {
    redis: redisKeys.length > 0,
    nitro: nitroKeys.length > 0,
    redisCount: redisKeys.length,
    nitroCount: nitroKeys.length,
  };
});
