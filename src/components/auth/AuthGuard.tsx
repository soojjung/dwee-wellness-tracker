'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * Gates protected route groups behind an existing session. Runs auth
 * hydration if it hasn't happened yet, then redirects to `/login` when
 * no user (anon or otherwise) is present. Anonymous sessions are
 * allowed — the guest tap on the login screen mints one explicitly.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (hydrated && !user) router.replace('/login');
  }, [hydrated, user, router]);

  if (!hydrated || !user) return null;
  return <>{children}</>;
}
