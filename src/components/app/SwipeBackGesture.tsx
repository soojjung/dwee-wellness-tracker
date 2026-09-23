'use client';
import { useEffect } from 'react';

/**
 * iOS 식 가장자리 스와이프 뒤로가기. 루트 레이아웃에 한 번만 둔다.
 *
 * 화면마다 뒤로가기 규칙이 달라서(단순 링크, history.back, "변경사항을 버릴까요?"
 * 확인) 제스처가 직접 이동하지 않는다. 뒤로가기 버튼에 `data-swipe-back` 을 달아
 * 두면, 스와이프가 끝났을 때 그 버튼을 누른 것과 똑같이 처리한다. 표식이 없는
 * 화면(탭 루트)에서는 아무 일도 하지 않는다.
 *
 * 손가락을 따라 페이지가 밀리고, 폭의 30% 를 넘거나 빠르게 튕기면 완료.
 */
const EDGE_PX = 28;
const LOCK_PX = 12;
const COMMIT_RATIO = 0.25;
const COMMIT_VELOCITY = 0.5; // px/ms
const SLIDE_MS = 150;

function backControl(): HTMLElement | null {
  // 오버레이(일정 상세 등)는 DOM 뒤쪽에 그려지므로 마지막 표식이 가장 위 화면이다.
  const all = document.querySelectorAll<HTMLElement>('[data-swipe-back]');
  return all[all.length - 1] ?? null;
}

function dialogOpen(): boolean {
  return document.querySelector('[role="dialog"], [role="alertdialog"]') !== null;
}

export function SwipeBackGesture() {
  useEffect(() => {
    const body = document.body;
    let control: HTMLElement | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let axis: 'none' | 'x' | 'y' = 'none';
    let animating = false;

    function reset() {
      control = null;
      axis = 'none';
      body.style.transform = '';
      body.style.transition = '';
      body.style.willChange = '';
    }

    function onStart(e: TouchEvent) {
      if (animating || e.touches.length !== 1) return;
      const t = e.touches[0];
      if (!t || t.clientX > EDGE_PX || dialogOpen()) return;
      const c = backControl();
      if (!c) return;
      control = c;
      startX = lastX = t.clientX;
      startY = t.clientY;
      lastT = e.timeStamp;
      velocity = 0;
      axis = 'none';
    }

    function onMove(e: TouchEvent) {
      if (!control || e.touches.length !== 1) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (axis === 'none') {
        if (Math.abs(dx) < LOCK_PX && Math.abs(dy) < LOCK_PX) return;
        if (Math.abs(dy) > Math.abs(dx) || dx < 0) {
          control = null;
          axis = 'y';
          return;
        }
        axis = 'x';
        body.style.willChange = 'transform';
        body.style.transition = 'none';
      }
      if (axis !== 'x') return;
      e.preventDefault();
      const dt = e.timeStamp - lastT;
      if (dt > 0) velocity = (t.clientX - lastX) / dt;
      lastX = t.clientX;
      lastT = e.timeStamp;
      body.style.transform = `translateX(${Math.max(0, dx)}px)`;
    }

    function onEnd() {
      if (!control || axis !== 'x') {
        reset();
        return;
      }
      const target = control;
      const dx = lastX - startX;
      const width = window.innerWidth;
      const commit = dx > width * COMMIT_RATIO || velocity > COMMIT_VELOCITY;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        reset();
        if (commit) target.click();
        return;
      }

      animating = true;
      body.style.transition = `transform ${SLIDE_MS}ms ease-out`;
      body.style.transform = commit ? `translateX(${width}px)` : 'translateX(0)';
      window.setTimeout(() => {
        animating = false;
        reset();
        if (commit) target.click();
      }, SLIDE_MS);
    }

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', onEnd);
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
      reset();
    };
  }, []);

  return null;
}
