import type { ReactNode } from 'react';
import type { Viewport } from 'next';

// 소개 슬라이드는 흰 배경(brand.gray50)이라 (auth) 의 핑크 테마 색을 쓰면 브라우저
// 상단바만 핑크로 뜬다. 그래서 로그인과 라우트 그룹을 나눠 둔다.
export const viewport: Viewport = {
  themeColor: '#FFFDFE',
};

export default function IntroLayout({ children }: { children: ReactNode }) {
  return (
    <div data-page-bg="white" className="mx-auto min-h-dvh w-full max-w-md bg-brand-gray50">
      {children}
    </div>
  );
}
