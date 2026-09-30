'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useDiaryFocusStore } from '@/store/diaryFocusStore';
import { NavIcon, type NavIconKey } from './NavIcon';

type TabKey = NavIconKey;
interface Tab {
  href: string;
  key: TabKey;
  labelKey: 'home' | 'log' | 'magazine' | 'settings';
}

const TABS: readonly Tab[] = [
  { href: '/', key: 'home', labelKey: 'home' },
  { href: '/log', key: 'log', labelKey: 'log' },
  { href: '/magazine', key: 'magazine', labelKey: 'magazine' },
  { href: '/settings', key: 'settings', labelKey: 'settings' },
];

// Tab bar shows only on the 4 tab-root routes; every detail/sub-route inside
// them keeps the screen immersive and relies on its own back link.
const SHOW_NAV_PATHS = ['/', '/log', '/magazine', '/settings'];

export function BottomTabNav() {
  const t = useT();
  const pathname = usePathname();
  const pingDiaryToday = useDiaryFocusStore((s) => s.pingToday);

  // next.config sets trailingSlash: true → normalize before allowlist check.
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  if (!SHOW_NAV_PATHS.includes(normalized)) return null;
  const activeIndex = TABS.findIndex((tab) =>
    tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href),
  );

  return (
    <>
      <div
        aria-hidden
        className={cn(
          'pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto h-[88px] w-full max-w-md',
          'bg-gradient-to-t from-[rgba(185,183,184,0.8)] to-[rgba(185,183,184,0)]',
        )}
      />
      <nav
        aria-label="primary"
        className="fixed inset-x-0 z-20 mx-auto flex w-full max-w-md justify-center px-4"
        style={{ bottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
      >
        <ul
          className={cn(
            'relative flex w-full items-center gap-2 rounded-[32px] border-[0.5px] border-nav-pillBorder',
            'bg-nav-pillBg p-[6px] shadow-[0_0_12px_0_rgba(0,0,0,0.06)] backdrop-blur-[8px]',
          )}
        >
          {/* 선택 탭의 분홍 알약은 탭마다 따로 칠하지 않고 하나를 옮긴다 — 탭을 바꾸면 새 탭
              쪽으로 미끄러진다. 탭바는 탭 전환 사이에 계속 마운트돼 있어 transform 전환이 이어진다.
              폭 = (전체 − 좌우 패딩 12 − 사이 간격 8×3) / 4, 한 칸 이동 = 자기 폭 + 간격 8. */}
          {activeIndex >= 0 ? (
            <li
              aria-hidden
              className={cn(
                'pointer-events-none absolute left-[6px] top-[6px] h-[52px] rounded-[32px]',
                'border-[0.5px] border-nav-activePillBorder bg-nav-activePillBg',
                'transition-transform duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
              )}
              style={{
                width: 'calc((100% - 36px) / 4)',
                transform: `translateX(calc(${activeIndex} * (100% + 8px)))`,
              }}
            />
          ) : null}
          {TABS.map((tab, i) => {
            const active = i === activeIndex;
            return (
              <li key={tab.key} className="relative flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={t.nav[tab.labelKey]}
                  onClick={tab.key === 'log' ? () => pingDiaryToday() : undefined}
                  className={cn(
                    'flex h-[52px] w-full items-center justify-center rounded-[32px] transition-colors duration-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-2',
                    active ? 'text-brand-pink200' : 'text-brand-gray900',
                  )}
                >
                  <NavIcon icon={tab.key} className="h-6 w-6" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
