import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { FullscreenShell } from '@/components/app/FullscreenShell';

export default function FullscreenLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <FullscreenShell>{children}</FullscreenShell>
    </AuthGuard>
  );
}
