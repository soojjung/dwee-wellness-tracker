'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';

const ARTICLE_HREF = '/magazine/personal-body-type';

/**
 * 공유 링크로 들어온 사람을 아티클로 넘긴다.
 *
 * 이 라우트는 체형별 OG 카드를 붙이려고 존재한다 — 정적 내보내기라 쿼리스트링으로는
 * OG 가 안 바뀌어서 타입마다 실제 경로가 필요했다. 크롤러는 메타 태그만 읽고 가므로
 * 본문은 사람이 잠깐 스치는 게 전부다. JS 가 죽었을 때를 위해 링크도 함께 둔다.
 */
export function ShareLandingRedirect() {
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    router.replace(ARTICLE_HREF);
  }, [router]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center bg-brand-gray50 px-6">
      <Link
        href={ARTICLE_HREF}
        className="text-center text-base font-medium text-brand-gray900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
      >
        {t.magazine.diagnose.result.shareTitle}
      </Link>
    </div>
  );
}
