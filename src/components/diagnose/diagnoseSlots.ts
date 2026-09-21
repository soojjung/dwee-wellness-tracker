import type { PickedPhoto } from './useBodyPhotoPicker';

/**
 * Shared across DiagnoseScreen and its extracted sub-views (state machine
 * types + IntroView both need the same slot vocabulary).
 */
export type Slot = 'front' | 'side' | 'back';
export const SLOT_ORDER: readonly Slot[] = ['front', 'side', 'back'] as const;

export type Photo = PickedPhoto;
export type Photos = Partial<Record<Slot, Photo>>;
