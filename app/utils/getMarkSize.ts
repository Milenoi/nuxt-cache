// Intrinsic dimensions of the brand marks in `public/svg/marks/`. Passed to the
// `<img>` width/height attributes so the browser can reserve the correct box
// (aspect ratio) before the SVG loads, avoiding layout shift (CLS). The CSS
// classes (`h-*` + `w-auto`) still control the rendered size.
export function getMarkSize(src: string): { width: number; height: number } {
  // Only the NASA mark is non-square; query/nitro/redis are all 24x24.
  if (src.includes("nasa")) return { width: 110, height: 92 };
  return { width: 24, height: 24 };
}
