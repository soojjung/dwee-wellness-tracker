export interface Size {
  width: number;
  height: number;
}

/**
 * Largest size that keeps `size`'s aspect ratio with neither edge above
 * `maxEdge`. Never upscales; dimensions are rounded to whole pixels.
 */
export function fitWithin(size: Size, maxEdge: number): Size {
  const longest = Math.max(size.width, size.height);
  if (longest <= maxEdge || longest === 0) return { width: size.width, height: size.height };
  const ratio = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(size.width * ratio)),
    height: Math.max(1, Math.round(size.height * ratio)),
  };
}
