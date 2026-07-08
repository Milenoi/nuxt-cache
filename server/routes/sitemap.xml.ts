// Static pages + the last 60 days of APOD detail pages (the gallery's range).
// Detail pages aren't linked from any static nav, so the sitemap is their main
// discovery path.
export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig().public;
  const DAY = 86_400_000;
  const end = Date.now() - DAY; // yesterday, matching the list endpoint
  const dates = Array.from({ length: 60 }, (_, i) =>
    new Date(end - i * DAY).toISOString().slice(0, 10),
  );
  const paths = [
    "/",
    "/apod",
    "/how",
    "/about",
    ...dates.map((d) => `/apod/${d}`),
  ];
  const urls = paths
    .map((p) => `  <url><loc>${siteUrl}${p}</loc></url>`)
    .join("\n");

  setHeader(event, "content-type", "application/xml; charset=utf-8");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
});
