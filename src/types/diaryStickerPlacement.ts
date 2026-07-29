export interface DiaryStickerPlacement {
  id: string;
  stickerId: string;
  year: number;
  monthIndex: number;
  /** Center x, pixels at a nominal 358px calendar container width. */
  x: number;
  /** Center y, pixels at a nominal 358px calendar container width. */
  y: number;
  /** Scale multiplier from the base sticker size. */
  scale: number;
  /** Rotation in degrees, positive = clockwise. */
  rotation: number;
  createdAt: string;
  updatedAt: string;
}

export const PLACEMENT_NOMINAL_WIDTH = 358;
export const PLACEMENT_BASE_SIZE = 96;
