'use client';
import { useEffect } from 'react';

/**
 * 모달 포커스 트랩. 루트 레이아웃에 한 번만 둔다 (SwipeBackGesture 와 같은 방식).
 *
 * 가장 위의 `aria-modal="true"` 가 열려 있는 동안 Tab / Shift+Tab 은 그 안에서만 돈다.
 * 모달이 뜨면 포커스를 모달로 옮기고(안에 이미 포커스가 있으면 그대로), 닫히면 열기 전에
 * 포커스가 있던 곳으로 돌려준다. 모달마다 훅을 달지 않아도 새 모달이 자동으로 따른다(R8-13).
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function topModal(): HTMLElement | null {
  // 겹쳐 뜨는 시트는 DOM 뒤쪽에 그려지므로 마지막 모달이 가장 위다.
  const all = document.querySelectorAll<HTMLElement>('[aria-modal="true"]');
  return all[all.length - 1] ?? null;
}

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    // display:none(숨은 file input 등)·inert 안쪽은 Tab 으로 갈 수 없다.
    (el) => !el.closest('[inert]') && el.getClientRects().length > 0,
  );
}

function focusModal(modal: HTMLElement) {
  if (!modal.hasAttribute('tabindex')) modal.setAttribute('tabindex', '-1');
  modal.focus({ preventScroll: true });
}

export function ModalFocusTrap() {
  useEffect(() => {
    const openers = new WeakMap<HTMLElement, HTMLElement | null>();
    let current: HTMLElement | null = null;

    function sync() {
      const top = topModal();
      if (top === current) return;
      const closed = current && !current.isConnected ? current : null;
      current = top;
      if (top && !openers.has(top)) {
        openers.set(top, document.activeElement as HTMLElement | null);
      }
      if (closed) {
        const back = openers.get(closed);
        if (back?.isConnected && (!top || top.contains(back))) {
          back.focus({ preventScroll: true });
          return;
        }
      }
      if (top && !top.contains(document.activeElement)) focusModal(top);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const modal = topModal();
      if (!modal) return;
      const items = focusables(modal);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        e.preventDefault();
        focusModal(modal);
        return;
      }
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && modal.contains(active) && active !== modal;
      if (e.shiftKey && (!inside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    }

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', onKeyDown, true);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, []);

  return null;
}
