import { get, set, del } from 'idb-keyval';
import type { MediaRepository } from '../../repositories/MediaRepository';
import {
  TEXT_ORDERS,
  TEXT_POSITIONS,
  isPhotoTransform,
  type PhotoCount,
  type PhotoSlot,
  type PhotoTransform,
  type TextOrder,
  type TextPosition,
} from '@/domain/home/decor';
import { STORAGE_KEYS } from './keys';

function isTextPosition(v: unknown): v is TextPosition {
  return typeof v === 'string' && (TEXT_POSITIONS as readonly string[]).includes(v);
}

function isTextOrder(v: unknown): v is TextOrder {
  return typeof v === 'string' && (TEXT_ORDERS as readonly string[]).includes(v);
}

export const indexedDBMediaAdapter: MediaRepository = {
  async getPhotoCount() {
    const v = await get<number>(STORAGE_KEYS.mediaPhotoCount);
    if (v === 1 || v === 2 || v === 4) return v;
    return null;
  },
  async setPhotoCount(count: PhotoCount) {
    await set(STORAGE_KEYS.mediaPhotoCount, count);
  },
  async getHomePhoto(slot: PhotoSlot) {
    return (await get<Blob>(STORAGE_KEYS.mediaPhoto(slot))) ?? null;
  },
  async setHomePhoto(slot: PhotoSlot, blob: Blob) {
    await set(STORAGE_KEYS.mediaPhoto(slot), blob);
  },
  async clearHomePhoto(slot: PhotoSlot) {
    await del(STORAGE_KEYS.mediaPhoto(slot));
  },

  async getPhotoTransform(slot: PhotoSlot) {
    const v = await get<unknown>(STORAGE_KEYS.mediaPhotoTransform(slot));
    return isPhotoTransform(v) ? v : null;
  },
  async setPhotoTransform(slot: PhotoSlot, transform: PhotoTransform) {
    await set(STORAGE_KEYS.mediaPhotoTransform(slot), transform);
  },
  async clearPhotoTransform(slot: PhotoSlot) {
    await del(STORAGE_KEYS.mediaPhotoTransform(slot));
  },

  async getTextPosition() {
    const v = await get<string>(STORAGE_KEYS.mediaTextPosition);
    return isTextPosition(v) ? v : null;
  },
  async setTextPosition(position: TextPosition) {
    await set(STORAGE_KEYS.mediaTextPosition, position);
  },
  async getMainText() {
    return (await get<string>(STORAGE_KEYS.mediaMainText)) ?? '';
  },
  async setMainText(text: string) {
    await set(STORAGE_KEYS.mediaMainText, text);
  },
  async getSubText() {
    return (await get<string>(STORAGE_KEYS.mediaSubText)) ?? '';
  },
  async setSubText(text: string) {
    await set(STORAGE_KEYS.mediaSubText, text);
  },
  async getTextOrder() {
    const v = await get<string>(STORAGE_KEYS.mediaTextOrder);
    return isTextOrder(v) ? v : null;
  },
  async setTextOrder(order: TextOrder) {
    await set(STORAGE_KEYS.mediaTextOrder, order);
  },
};
