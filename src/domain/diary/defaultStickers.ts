import type { StickerRatio } from '@/types';

export interface DefaultStickerSeed {
  filename: string;
  ratio: StickerRatio;
}

/**
 * 스티커 보관함에 보이는 순서 그대로다. 실제 시딩은 `ensureDefaultStickersSeeded`
 * 가 뒤에서부터 넣는다 — 어댑터가 새 항목을 맨 앞에 쌓기 때문.
 */
export const DEFAULT_STICKERS: readonly DefaultStickerSeed[] = [
  { filename: 'glass-lemon.png', ratio: '4:3' },
  { filename: 'matcha.png', ratio: '4:3' },
  { filename: 'avocado-toast.png', ratio: '1:1' },
  { filename: 'airpods-max.png', ratio: '4:3' },
  { filename: 'workout.png', ratio: '4:3' },
];

export function defaultStickerUrl(filename: string): string {
  return `/stickers/default/${filename}`;
}
