export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig().public;
  setHeader(event, "content-type", "text/plain; charset=utf-8");
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
});
