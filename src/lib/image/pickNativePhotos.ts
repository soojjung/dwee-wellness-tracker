import { Camera } from '@capacitor/camera';

/**
 * Opens the native OS photo-library picker (Capacitor `Camera.pickImages`)
 * and resolves the picked photos as Files. Only meaningful when
 * `Capacitor.isNativePlatform()` is true — callers still need their own web
 * fallback (a hidden `<input type="file">`) for the browser case.
 *
 * Cancelling the picker, or the picker being unavailable, resolves to `[]`
 * rather than throwing.
 */
export async function pickNativePhotos(limit: number): Promise<File[]> {
  try {
    const result = await Camera.pickImages({ limit, quality: 90 });
    const files: File[] = [];
    for (const photo of result.photos.slice(0, limit)) {
      if (!photo.webPath) continue;
      const blob = await (await fetch(photo.webPath)).blob();
      // 피커가 주는 blob 은 MIME 이 비어 있을 수 있다. pickImages 는 기본으로
      // jpeg 를 돌려주므로 그때는 jpeg 로 본다.
      files.push(
        new File([blob], `photo-${files.length}.jpg`, { type: blob.type || 'image/jpeg' }),
      );
    }
    return files;
  } catch {
    // 사용자가 취소했거나 피커를 열 수 없는 경우 — 빈 배열.
    return [];
  }
}
