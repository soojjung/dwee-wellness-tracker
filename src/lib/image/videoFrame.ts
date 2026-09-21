import { canvasToBlob } from './canvas';
import { centerCropRect } from './stickerFrame';

/**
 * Capture what the viewfinder is showing. The <video> is `object-cover`, so
 * the visible part is the centre of the frame at the element's own aspect —
 * grab exactly that from the intrinsic pixels so the shot matches the preview
 * regardless of on-screen scaling.
 */
export async function grabFrame(video: HTMLVideoElement): Promise<Blob> {
  const viewAspect =
    video.clientWidth > 0 && video.clientHeight > 0
      ? video.clientWidth / video.clientHeight
      : video.videoWidth / video.videoHeight;
  const rect = centerCropRect(video.videoWidth, video.videoHeight, viewAspect);
  const sx = Math.round(rect.sx);
  const sy = Math.round(rect.sy);
  const sw = Math.round(rect.sw);
  const sh = Math.round(rect.sh);
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-context-unavailable');
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  if (!blob) throw new Error('canvas-toBlob-null');
  return blob;
}
