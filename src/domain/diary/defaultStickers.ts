import type { StickerRatio } from '@/types';

export interface DefaultStickerSeed {
  filename: string;
  ratio: StickerRatio;
}

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
