import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
