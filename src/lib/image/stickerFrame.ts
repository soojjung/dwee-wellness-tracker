import type { StickerRatio } from '@/types';

/** "4:3" 라벨은 시안대로 세로형 3:4 프레임이다 (가로:세로 = 3:4). */
export const STICKER_RATIO_ASPECT: Record<StickerRatio, number> = {
  '1:1': 1,
  '4:3': 3 / 4,
};

// 이보다 넓은 원본은 정사각에 가까워 1:1 이 덜 잘린다. 그보다 좁으면 세로형 3:4 가 낫다.
const SQUARE_ASPECT_CUTOFF = 0.875;

/** 비율 선택 단계를 거치지 않는 경로(스티커 누끼)에서 원본 모양으로 배치 프레임을 정한다. */
export function stickerRatioForAspect(aspect: number): StickerRatio {
  return aspect >= SQUARE_ASPECT_CUTOFF ? '1:1' : '4:3';
}

export interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/** `width`×`height` 원본에서 `targetAspect`(가로/세로)에 맞는 가장 큰 영역을 가운데 기준으로 고른다. */
export function centerCropRect(width: number, height: number, targetAspect: number): CropRect {
  const sourceAspect = width / height;
  if (sourceAspect > targetAspect) {
    const sw = height * targetAspect;
    return { sx: (width - sw) / 2, sy: 0, sw, sh: height };
  }
  if (sourceAspect < targetAspect) {
    const sh = width / targetAspect;
    return { sx: 0, sy: (height - sh) / 2, sw: width, sh };
  }
  return { sx: 0, sy: 0, sw: width, sh: height };
}

export interface PixelBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * RGBA 픽셀 배열에서 알파가 `alphaThreshold` 를 넘는 픽셀을 모두 감싸는 가장 작은
 * 사각형. 그런 픽셀이 하나도 없으면 null.
 */
export function opaqueBounds(
  rgba: ArrayLike<number>,
  width: number,
  height: number,
  alphaThreshold: number,
): PixelBounds | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    const rowStart = y * width * 4;
    for (let x = 0; x < width; x++) {
      if ((rgba[rowStart + x * 4 + 3] ?? 0) <= alphaThreshold) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * 축소본(`scale` 배)에서 찾은 경계를 원본 좌표로 되돌리고 `padding`(원본 px)만큼
 * 넓힌 뒤 원본 크기 안으로 자른다. 축소하면 경계가 최대 1px(축소본 기준) 안쪽으로
 * 밀릴 수 있어 그만큼을 먼저 바깥으로 되돌린다.
 */
export function expandBounds(
  bounds: PixelBounds,
  scale: number,
  padding: number,
  fullWidth: number,
  fullHeight: number,
): PixelBounds {
  const left = Math.max(0, Math.floor((bounds.x - 1) / scale - padding));
  const top = Math.max(0, Math.floor((bounds.y - 1) / scale - padding));
  const right = Math.min(fullWidth, Math.ceil((bounds.x + bounds.width + 1) / scale + padding));
  const bottom = Math.min(fullHeight, Math.ceil((bounds.y + bounds.height + 1) / scale + padding));
  return { x: left, y: top, width: right - left, height: bottom - top };
}
