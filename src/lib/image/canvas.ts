/**
 * Promise wrapper around `HTMLCanvasElement#toBlob`. Resolves `null` when
 * the canvas can't produce a blob (same as the underlying callback) — it's
 * up to each caller to decide whether that's fatal.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}
