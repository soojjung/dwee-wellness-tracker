import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DevBridge } from '@/dev/DevBridge';
import { NativeChrome } from '@/components/app/NativeChrome';

// en-US is the primary market (see .claude memory: feedback_localization).
// OG metadata is server-rendered once — social crawlers can't see client i18n —
// so we ship en as the default and expose ko_KR as an alternate locale hint.
// The OG image itself is just the "dwee" wordmark on a pink card, so it's
// locale-neutral and reused across locales.
const OG_TITLE = 'dwee — Track your cycle and wellness, your way';
const OG_DESCRIPTION =
  'A gentle diary that treats your cycle as a natural everyday rhythm — styled to your taste.';
const OG_IMAGE = '/og-image.png';
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: OG_TITLE,
  description: OG_DESCRIPTION,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    siteName: 'dwee',
    locale: 'en_US',
    alternateLocale: ['ko_KR'],
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'dwee',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  // brand.gray200 — 마이페이지·다이어리·리포트가 쓰는 연회색. 당겨서 새로고침이나
  // 노치 영역처럼 화면 밖이 드러나는 곳도 같은 색이어야 띠가 생기지 않는다.
  themeColor: '#F5F3F4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-brand-gray200 text-neutral-900 antialiased">
        <DevBridge />
        <NativeChrome />
        {children}
      </body>
    </html>
  );
}
