// POST-only (via the .post suffix) so it can't be triggered by a GET prefetch,
// crawler or link. It also clears ONLY this app's `apod:` namespace, never the
// whole Redis instance (which may be shared).
export default defineEventHandler(async () => {
  const storage = useStorage("redis");

  try {
    const keys = await storage.getKeys("apod");
    await Promise.all(keys.map((key) => storage.removeItem(key)));

    return {
      status: 200,
      message: `Cleared ${keys.length} cached entries — the next fetch will hit NASA.`,
    };
  } catch {
    return {
      status: 500,
      error: "Internal Server Error",
      message: "Failed to clear the Redis cache.",
    };
  }
});
