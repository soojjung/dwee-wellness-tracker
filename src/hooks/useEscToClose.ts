'use client';
import { useEffect } from 'react';

// Closes a modal when the user presses Escape. Every mounted hook fires (they
// all sit on the same window capture listener list, and stopPropagation does
// not stop sibling listeners), so a screen that stacks sheets must pass
// `active = false` on the covered ones — see EventFormSheet / DiaryScreen.
export function useEscToClose(onClose: () => void, active: boolean = true): void {
  useEffect(() => {
    if (!active) return;
    function handler(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
    }
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [onClose, active]);
}
