import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface MyPageCardProps {
  title?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Dark background variant used by the logged-in auth card. */
  variant?: 'default' | 'dark';
}

/**
 * White rounded card used across MyPage sections. `title` shows a small
 * section header (Figma: gray label above the content). `variant="dark"` is
 * the special auth card shown when the user is signed in.
 */
export function MyPageCard({
  title,
  headerRight,
  children,
  className,
  variant = 'default',
}: MyPageCardProps) {
  const dark = variant === 'dark';
  return (
    <section
      className={cn(
        'rounded-2xl px-4 py-4',
        dark ? 'bg-brand-gray900 text-brand-white' : 'bg-brand-white',
        className,
      )}
    >
      {title || headerRight ? (
        <div className="mb-2 flex items-center justify-between">
          {title ? (
            <span
              className={cn(
                'text-xs font-medium',
                dark ? 'text-brand-gray300' : 'text-brand-gray600',
              )}
            >
              {title}
            </span>
          ) : (
            <span />
          )}
          {headerRight}
        </div>
      ) : null}
      {children}
    </section>
  );
}
