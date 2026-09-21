'use client';
import { useState } from 'react';

interface UseSelectionSetResult<T> {
  selected: Set<T>;
  /** Toggles membership of `id`. `onNext`, if given, runs synchronously
   * inside the state updater with the freshly computed set — use it for
   * side effects that must see the post-toggle membership (e.g. clearing
   * a dependent field only when the item just became deselected). */
  toggle: (id: T, onNext?: (next: Set<T>) => void) => void;
  clear: () => void;
  has: (id: T) => boolean;
}

/** Shared Set-based multi-select state: toggle one id, clear all, check membership. */
export function useSelectionSet<T>(initial: Set<T> = new Set()): UseSelectionSetResult<T> {
  const [selected, setSelected] = useState<Set<T>>(initial);

  function toggle(id: T, onNext?: (next: Set<T>) => void) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onNext?.(next);
      return next;
    });
  }

  function clear() {
    setSelected(new Set());
  }

  function has(id: T) {
    return selected.has(id);
  }

  return { selected, toggle, clear, has };
}
