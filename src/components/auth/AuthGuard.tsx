'use client';
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * Gates protected route groups behind an existing session. Runs auth
 * hydration if it hasn't happened yet, then redirects to `/login` when
 * no user (anon or otherwise) is present. Anonymous sessions are
 * allowed — the guest tap on the login screen mints one explicitly.
 *
 * `PUBLIC_PREFIXES` is the exception: pages someone can land on from a link
 * we handed out ourselves. Gating those would bounce a first-time visitor to
 * `/login` before they ever see what was shared with them.
 */
const PUBLIC_PREFIXES = ['/magazine/personal-body-type/share'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  // next.config 의 trailingSlash 때문에 경로 끝에 `/` 가 붙는다.
  const pathname = usePathname().replace(/\/$/, '') || '/';
  const isPublic = isPublicPath(pathname);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (!isPublic && hydrated && !user) router.replace('/login');
  }, [isPublic, hydrated, user, router]);

  if (isPublic) return <>{children}</>;
  if (!hydrated || !user) return null;
  return <>{children}</>;
}
