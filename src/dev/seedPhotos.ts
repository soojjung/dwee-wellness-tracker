// Snapshot/test helper: seed photoCount + slot blobs so the photo-edit
// screen has data to render. Uses a canvas-generated solid-color JPEG so
// we don't need binary fixtures in the repo. The Blob is detached from
// the canvas via an intermediate ArrayBuffer to avoid IndexedDB structured
// clone quirks (see tests/photo-edit.spec.ts for the WebKit/Playwright
// limitation that currently keeps the matching spec skipped).
import { ensureMigrations, mediaRepo } from '@/data';
import { PHOTO_SLOTS, type PhotoCount } from '@/domain/home/decor';

const COLORS = ['#FBB7D8', '#FDE2EF', '#F689BC', '#FBD0DE'];

async function makeColoredJpegBlob(color: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-2d-context-unavailable');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 320, 320);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('canvas-toBlob-null'))),
      'image/jpeg',
      0.9,
    );
  });
}

export async function seedPhotos(count: PhotoCount): Promise<void> {
  if (process.env.NODE_ENV === 'production') return;
  await ensureMigrations();
  await mediaRepo.setPhotoCount(count);
  for (let i = 0; i < count; i++) {
    const slot = PHOTO_SLOTS[i]!;
    const canvasBlob = await makeColoredJpegBlob(COLORS[i % COLORS.length]!);
    const buf = await canvasBlob.arrayBuffer();
    const blob = new Blob([buf], { type: 'image/jpeg' });
    await mediaRepo.setHomePhoto(slot, blob);
  }
}
