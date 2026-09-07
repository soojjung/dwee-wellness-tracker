'use client';
import { useEffect } from 'react';

const STORAGE_PREFIX = 'dwee:ui:scroll:';
// 카드들이 하이드레이션되며 문서가 자라는 동안 목표 위치가 잘린다. 문서가 충분히
// 길어질 때까지 프레임마다 다시 시도한다 (60프레임 ≈ 1초면 하이드레이션이 끝난다).
const MAX_RESTORE_FRAMES = 60;

/**
 * 목록 화면의 스크롤 위치를 세션 동안 보존한다.
 *
 * Next 의 기본 복원은 popstate 직후 한 번만 일어나서, 이 화면처럼 스토어
 * 하이드레이션 후에야 카드 높이가 확정되는 경우엔 문서가 아직 짧아 목표 위치가
 * 잘린 채 끝난다. 그래서 위치를 직접 들고 있다가 도달할 때까지 재시도한다.
 *
 * 사용자가 먼저 스크롤하면 복원을 즉시 포기한다 — 되돌리는 게 더 거슬린다.
 */
export function useScrollRestore(key: string) {
  useEffect(() => {
    const storageKey = `${STORAGE_PREFIX}${key}`;

    let target = 0;
    try {
      target = Number(sessionStorage.getItem(storageKey) ?? '0') || 0;
    } catch {
      /* private mode 등 — 복원 없이 진행 */
    }

    let restoreRaf = 0;
    let frames = 0;
    let restoring = target > 0;

    function stopRestoring() {
      restoring = false;
      if (restoreRaf) cancelAnimationFrame(restoreRaf);
      restoreRaf = 0;
    }

    function step() {
      if (!restoring) return;
      window.scrollTo(0, target);
      frames += 1;
      if (Math.abs(window.scrollY - target) <= 1 || frames >= MAX_RESTORE_FRAMES) {
        stopRestoring();
        return;
      }
      restoreRaf = requestAnimationFrame(step);
    }

    if (restoring) restoreRaf = requestAnimationFrame(step);

    const USER_INPUT = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    USER_INPUT.forEach((type) => window.addEventListener(type, stopRestoring, { passive: true }));

    let saveRaf = 0;
    function onScroll() {
      if (saveRaf) return;
      saveRaf = requestAnimationFrame(() => {
        saveRaf = 0;
        // 복원 루프가 쓴 값을 다시 저장하는 건 무해하다 (같은 값).
        try {
          sessionStorage.setItem(storageKey, String(window.scrollY));
        } catch {
          /* ignore */
        }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      stopRestoring();
      if (saveRaf) cancelAnimationFrame(saveRaf);
      USER_INPUT.forEach((type) => window.removeEventListener(type, stopRestoring));
      window.removeEventListener('scroll', onScroll);
    };
  }, [key]);
}
