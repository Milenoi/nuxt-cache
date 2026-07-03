const shared = {
  quality: 80,
  format: ["avif", "webp"],
  // Allowlist for transforming remote images (also mirrored in netlify.toml).
  domains: ["apod.nasa.gov", "img.youtube.com", "i.ytimg.com"],
  screens: {
    xs: 600,
    sm: 960,
    md: 1280,
    lg: 1920,
    xl: 2400,
  },
};

// Production (Netlify) → Netlify Image CDN (/.netlify/images) at the edge, no
// serverless IPX. Local `nuxt dev` → IPX, since /.netlify/images isn't available.
const imageConfig =
  process.env.NODE_ENV === "development"
    ? shared
    : { provider: "netlify", ...shared };

export default imageConfig;
