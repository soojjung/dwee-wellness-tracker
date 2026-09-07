'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

interface MyPageBackLinkProps {
  ariaLabel: string;
}

/**
 * 마이페이지 하위 화면의 뒤로가기 버튼.
 *
 * `<Link href="/settings">` 로 두면 push 내비게이션이라 목록이 항상 최상단으로
 * 리셋된다. history 가 있으면 back() 으로 돌아가 브라우저/Next 의 스크롤 복원을
 * 그대로 쓰고, 딥링크로 바로 진입해 돌아갈 기록이 없을 때만 push 로 폴백한다.
 *
 * `href` 는 그대로 남겨 둔다 — 새 탭 열기·가운데 클릭·크롤러가 목적지를 알 수 있어야
 * 하고, JS 가 아직 붙기 전 클릭도 동작해야 하기 때문.
 */
export function MyPageBackLink({ ariaLabel }: MyPageBackLinkProps) {
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // 새 탭/새 창을 의도한 클릭은 기본 동작에 맡긴다.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (typeof window === 'undefined' || window.history.length <= 1) return;
    e.preventDefault();
    router.back();
  }

  return (
    <Link
      href="/settings"
      onClick={handleClick}
      aria-label={ariaLabel}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </Link>
  );
}
