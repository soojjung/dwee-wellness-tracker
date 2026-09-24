import { canvasToBlob } from './canvas';
import { fitWithin } from './fit';

/**
 * Re-encode a photo so its long edge is at most `maxEdge`, as JPEG.
 * Camera-roll originals are 3–5 MB; home photos render in a ≤448px column
 * (even at 4× zoom a ~2k edge stays sharp), so uploading the original only
 * makes the save slow on cellular. Falls back to the original blob when it's
 * already small enough or the browser can't decode it.
 */
export async function downscaleImage(blob: Blob, maxEdge = 2048, quality = 0.85): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return blob;
  }
  try {
    const target = fitWithin({ width: bitmap.width, height: bitmap.height }, maxEdge);
    if (target.width === bitmap.width && target.height === bitmap.height) return blob;
    const canvas = document.createElement('canvas');
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return blob;
    ctx.drawImage(bitmap, 0, 0, target.width, target.height);
    return (await canvasToBlob(canvas, 'image/jpeg', quality)) ?? blob;
  } finally {
    bitmap.close();
  }
}
