import type { DiaryStickerPlacement } from '@/types';

export interface NewDiaryStickerPlacementInput {
  stickerId: string;
  year: number;
  monthIndex: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface DiaryStickerPlacementRepository {
  listByMonth(year: number, monthIndex: number): Promise<DiaryStickerPlacement[]>;
  add(input: NewDiaryStickerPlacementInput): Promise<DiaryStickerPlacement>;
  update(
    id: string,
    patch: Partial<Omit<DiaryStickerPlacement, 'id' | 'createdAt'>>,
  ): Promise<DiaryStickerPlacement | null>;
  remove(id: string): Promise<void>;
}
