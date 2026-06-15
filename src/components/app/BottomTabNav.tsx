'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
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

  // next.config sets trailingSlash: true → normalize before allowlist check.
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  if (!SHOW_NAV_PATHS.includes(normalized)) return null;

  return (
    <nav
      aria-label="primary"
      className="fixed inset-x-0 bottom-6 z-20 flex justify-center px-5"
    >
      <ul
        className={cn(
          'flex items-center gap-2 rounded-[32px] border-[0.5px] border-nav-pillBorder',
          'bg-nav-pillBg p-[6px] shadow-[0_0_12px_0_rgba(0,0,0,0.06)] backdrop-blur-[8px]',
        )}
      >
        {TABS.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                aria-label={t.nav[tab.labelKey]}
                className={cn(
                  'flex h-12 w-16 items-center justify-center rounded-[32px] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-2',
                  active
                    ? 'border-[0.5px] border-nav-activePillBorder bg-nav-activePillBg text-brand-pink200'
                    : 'text-brand-gray900',
                )}
              >
                <NavIcon icon={tab.key} className="h-6 w-6" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
