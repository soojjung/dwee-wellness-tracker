'use client';
import { useEffect } from 'react';

// Closes a modal when the user presses Escape. Only the topmost modal reacts
// because addEventListener('keydown', ...) captures then propagates — later
// mounts see the event first via capture: true.
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
