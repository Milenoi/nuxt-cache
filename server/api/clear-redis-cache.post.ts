// POST-only (via the .post suffix) so it can't be triggered by a GET prefetch,
// crawler or link. It also clears ONLY this app's own namespaces (`apod:` and
// `content:`), never the whole Redis instance (which may be shared).
export default defineEventHandler(async () => {
  const storage = useStorage("redis");

  try {
    const keys = [
      ...(await storage.getKeys("apod")),
      ...(await storage.getKeys("content")),
    ];
    await Promise.all(keys.map((key) => storage.removeItem(key)));

    const count = keys.length;
    const message =
      count === 0
        ? "Redis cache was already empty."
        : `Redis cache cleared (${count} ${count === 1 ? "entry" : "entries"}).`;

    return { status: 200, message };
  } catch {
    return {
      status: 500,
      error: "Internal Server Error",
      message: "Failed to clear the Redis cache.",
    };
  }
});
