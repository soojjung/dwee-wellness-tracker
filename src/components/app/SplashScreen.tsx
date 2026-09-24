'use client';
import { useEffect } from 'react';
import { useT } from '@/i18n/useT';
import { markSplashShown } from '@/lib/splashClock';

// Figma 849:5052 (000 스플래시). 데이터 로딩 동안만 보이는 화면.
export function SplashScreen() {
  const t = useT();
  // 자식 effect 가 부모보다 먼저 돌아서, OnboardingScreen 의 useBootDelay 보다 앞서 찍힌다.
  useEffect(() => {
    markSplashShown(performance.now());
  }, []);
  return (
    <div
      role="status"
      aria-label={t.app.name}
      data-page-bg="pink"
      className="fixed inset-0 z-50 mx-auto flex max-w-md items-center justify-center bg-auth-bg"
    >
      <img
        src="/brand/wordmark-dwee.svg"
        alt=""
        width={161}
        height={46}
        className="select-none"
        draggable={false}
      />
    </div>
  );
}
