'use client';
import { useT } from '@/i18n/useT';

// Figma 849:5052 (000 스플래시). 데이터 로딩 동안만 보이는 화면.
export function SplashScreen() {
  const t = useT();
  return (
    <div
      role="status"
      aria-label={t.app.name}
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
