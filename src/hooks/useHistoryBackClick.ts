'use client';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

/**
 * 하위 화면의 "뒤로" 링크용 클릭 핸들러.
 *
 * `<Link href="/목록">` 만 두면 push 내비게이션이라 목록이 항상 최상단으로 리셋된다.
 * 돌아갈 기록이 있으면 back() 으로 가서 보던 위치가 복원되게 하고, 딥링크로 바로
 * 들어와 기록이 없을 때만 링크의 href 로 폴백한다.
 *
 * `href` 는 링크에 그대로 남겨 둔다 — 새 탭 열기·가운데 클릭·크롤러가 목적지를 알 수
 * 있어야 하고, JS 가 아직 붙기 전 클릭도 동작해야 하기 때문.
 */
/**
 * 바로 앞 기록이 "이 앱의 화면"인지. `history.length` 만으로는 알 수 없다 — 다른 사이트를
 * 보던 탭에서 링크로 바로 들어와도 1보다 크고, 그때 back() 을 부르면 앱 밖으로 나가 버린다.
 * Navigation API 의 entries 는 같은 출처의 연속된 기록만 담으므로 index 가 0 보다 크면 앞
 * 기록이 앱 안이라는 뜻이다. 지원하지 않는 브라우저(구형 WebView)만 옛 추정으로 폴백한다.
 */
export function hasInAppHistory(): boolean {
  if (typeof window === 'undefined') return false;
  // lib.dom 에 아직 타입이 없는 환경이 있어 필요한 모양만 좁혀서 읽는다.
  const nav = (window as { navigation?: { currentEntry?: { index: number } | null } }).navigation;
  if (nav?.currentEntry) return nav.currentEntry.index > 0;
  return window.history.length > 1;
}

export function useHistoryBackClick() {
  const router = useRouter();

  return function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // 새 탭/새 창을 의도한 클릭은 기본 동작에 맡긴다.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!hasInAppHistory()) return;
    e.preventDefault();
    router.back();
  };
}
