'use client';
import { useSettingsStore } from './settingsStore';
import { usePeriodStore } from './periodStore';
import { useConditionStore } from './conditionStore';
import { useMediaStore } from './mediaStore';

/**
 * Refreshes every data-backed store from the currently active repo adapter.
 * Called after `setRepoMode` flips (sign-in, sign-out, session restore) so
 * cached in-memory state never disagrees with the target backend.
 */
export async function rehydrateAllData(): Promise<void> {
  await Promise.all([
    useSettingsStore.getState().rehydrate(),
    usePeriodStore.getState().rehydrate(),
    useConditionStore.getState().rehydrate(),
    useMediaStore.getState().rehydrate(),
  ]);
}
