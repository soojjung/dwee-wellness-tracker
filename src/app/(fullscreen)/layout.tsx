import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function FullscreenLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-dvh">{children}</div>
    </AuthGuard>
  );
}
