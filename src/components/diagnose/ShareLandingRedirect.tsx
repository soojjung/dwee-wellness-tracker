'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';

// 공유 링크로 들어온 사람은 매거진 목록으로 보낸다.
const MAGAZINE_HREF = '/magazine';

/**
 * 공유 링크로 들어온 사람을 매거진으로 넘긴다.
 *
 * 이 라우트는 체형별 OG 카드를 붙이려고 존재한다 — 정적 내보내기라 쿼리스트링으로는
 * OG 가 안 바뀌어서 타입마다 실제 경로가 필요했다. 크롤러는 메타 태그만 읽고 간다.
 *
 * 세션이 있을 때만 자동으로 넘긴다. `/magazine` 은 AuthGuard 뒤에 있어서, 처음
 * 링크를 받은 사람을 그냥 보내면 로그인 화면으로 튕긴다. 그 경우엔 이 화면에
 * 머무르게 두고 링크만 보여준다 — 눌러서 들어가면 평소대로 로그인 게이트를 만난다.
 */
export function ShareLandingRedirect() {
  const router = useRouter();
  const t = useT();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (hydrated && user) router.replace(MAGAZINE_HREF);
  }, [hydrated, user, router]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center bg-brand-gray50 px-6">
      <Link
        href={MAGAZINE_HREF}
        className="text-center text-base font-medium text-brand-gray900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
      >
        {t.magazine.diagnose.result.shareTitle}
      </Link>
    </div>
  );
}
