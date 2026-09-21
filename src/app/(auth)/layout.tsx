import type { ReactNode } from 'react';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#FDE2EF',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    // data-page-bg: 상태바·주소창 뒤까지 핑크로 맞춘다 (globals.css 참고).
    <div data-page-bg="pink" className="mx-auto min-h-dvh w-full max-w-md bg-auth-bg">
      {children}
    </div>
  );
}
