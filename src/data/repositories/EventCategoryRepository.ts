import type { EventCategory, ColorPaletteId } from '@/types';

export interface NewEventCategoryInput {
  name: string;
  colorId: ColorPaletteId;
  isBuiltIn?: boolean;
  order?: number;
}

export interface EventCategoryRepository {
  list(): Promise<EventCategory[]>;
  add(input: NewEventCategoryInput): Promise<EventCategory>;
  update(
    id: string,
    patch: Partial<Omit<EventCategory, 'id' | 'createdAt'>>,
  ): Promise<EventCategory | null>;
  remove(id: string): Promise<void>;
}
