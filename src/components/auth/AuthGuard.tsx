'use client';
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useIntroStore } from '@/store/introStore';
import { SplashScreen } from '@/components/app/SplashScreen';

/**
 * Gates protected route groups behind an existing session. Runs auth
 * hydration if it hasn't happened yet, then sends a visitor with no user
 * (anon or otherwise) to `/onboarding` on this device's first launch and to
 * `/login` after that. Anonymous sessions are allowed — the guest tap on the
 * login screen mints one explicitly.
 *
 * `PUBLIC_PREFIXES` is the exception: pages someone can land on from a link
 * we handed out ourselves. Gating those would bounce a first-time visitor to
 * `/login` before they ever see what was shared with them.
 */
const PUBLIC_PREFIXES = ['/magazine/personal-body-type/share'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  // next.config 의 trailingSlash 때문에 경로 끝에 `/` 가 붙는다.
  const pathname = usePathname().replace(/\/$/, '') || '/';
  const isPublic = isPublicPath(pathname);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const hydrateIntro = useIntroStore((s) => s.hydrate);
  const introHydrated = useIntroStore((s) => s.hydrated);
  const introSeen = useIntroStore((s) => s.seen);
  const markIntroSeen = useIntroStore((s) => s.markSeen);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (!introHydrated) hydrateIntro();
  }, [introHydrated, hydrateIntro]);

  useEffect(() => {
    if (isPublic || !hydrated || user || !introHydrated) return;
    router.replace(introSeen ? '/login' : '/onboarding');
  }, [isPublic, hydrated, user, introHydrated, introSeen, router]);

  // 온보딩이 생기기 전부터 쓰던 기기는 플래그 없이 세션만 있다. 세션이 있으면 본
  // 것으로 쳐야 로그아웃했을 때 소개 화면이 뒤늦게 뜨지 않는다.
  useEffect(() => {
    if (user && introHydrated && !introSeen) void markIntroSeen();
  }, [user, introHydrated, introSeen, markIntroSeen]);

  if (isPublic) return <>{children}</>;
  if (!hydrated || !user) return <SplashScreen />;
  return <>{children}</>;
}
