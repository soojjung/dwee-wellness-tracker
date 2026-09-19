import { get, set } from 'idb-keyval';
import type { IntroRepository } from '../../repositories/IntroRepository';
import { STORAGE_KEYS } from './keys';

export const indexedDBIntroAdapter: IntroRepository = {
  async isSeen() {
    return (await get<boolean>(STORAGE_KEYS.introSeen)) === true;
  },
  async markSeen() {
    await set(STORAGE_KEYS.introSeen, true);
  },
};
