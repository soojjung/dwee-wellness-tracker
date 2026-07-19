import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DevBridge } from '@/dev/DevBridge';

export const metadata: Metadata = {
  title: 'dwee',
  description: '내 몸의 리듬을 부드럽게 기록하는 웰니스 앱',
};

export const viewport: Viewport = {
  themeColor: '#FFF8F5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh bg-[#FFF8F5] text-neutral-900 antialiased">
        <DevBridge />
        {children}
      </body>
    </html>
  );
}
