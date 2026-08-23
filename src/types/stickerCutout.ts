export type StickerCutoutError =
  | 'unauthenticated'
  | 'rate_limit_exceeded'
  | 'quota_exceeded'
  | 'image_too_large'
  | 'invalid_media_type'
  | 'missing_image'
  | 'image_refused'
  | 'remove_bg_failed'
  | 'remove_bg_unreachable'
  | 'aborted'
  | 'unknown';

export interface StickerCutoutSuccess {
  /** PNG with alpha, ready to persist / display. */
  blob: Blob;
  /** Daily calls remaining for this user. */
  remaining: number;
}
