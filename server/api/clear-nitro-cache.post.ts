// POST-only (via the .post suffix) so it can't be triggered by a GET prefetch,
// crawler or link. Clears ONLY the Nitro SWR entries for this app (the
// `apod-nitro` group in the `cache` storage mount), never anything else.
export default defineEventHandler(async () => {
  const storage = useStorage("cache");

  try {
    const keys = await storage.getKeys("apod-nitro");
    await Promise.all(keys.map((key) => storage.removeItem(key)));

    const count = keys.length;
    const message =
      count === 0
        ? "Nitro cache was already empty."
        : `Nitro cache cleared (${count} ${count === 1 ? "entry" : "entries"}).`;

    return { status: 200, message };
  } catch {
    return {
      status: 500,
      error: "Internal Server Error",
      message: "Failed to clear the Nitro cache.",
    };
  }
});
