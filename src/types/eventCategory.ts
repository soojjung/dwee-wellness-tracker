export type ColorPaletteId =
  | 'pink'
  | 'lavender'
  | 'gray'
  | 'mint'
  | 'melon'
  | 'apricot'
  | 'peach';

export interface EventCategory {
  id: string;
  name: string;
  colorId: ColorPaletteId;
  isBuiltIn: boolean;
  order: number;
  createdAt: string;
}
