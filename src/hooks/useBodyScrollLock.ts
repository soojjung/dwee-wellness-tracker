'use client';
import { useEffect } from 'react';

// Locks background page scroll while a modal is mounted. Prevents the
// double-scrollbar effect on desktop (modal body scrolls + page body scrolls).
// Reference-counts across nested modals via a shared counter on <body>.
const COUNTER_ATTR = 'data-scroll-lock-count';

export function useBodyScrollLock(active: boolean = true): void {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    const html = document.documentElement;
    const current = Number(body.getAttribute(COUNTER_ATTR) ?? '0');
    if (current === 0) {
      body.dataset.scrollLockPrevOverflow = body.style.overflow;
      html.dataset.scrollLockPrevOverflow = html.style.overflow;
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    }
    body.setAttribute(COUNTER_ATTR, String(current + 1));
    return () => {
      const next = Number(body.getAttribute(COUNTER_ATTR) ?? '1') - 1;
      if (next <= 0) {
        body.removeAttribute(COUNTER_ATTR);
        body.style.overflow = body.dataset.scrollLockPrevOverflow ?? '';
        html.style.overflow = html.dataset.scrollLockPrevOverflow ?? '';
        delete body.dataset.scrollLockPrevOverflow;
        delete html.dataset.scrollLockPrevOverflow;
      } else {
        body.setAttribute(COUNTER_ATTR, String(next));
      }
    };
  }, [active]);
}
