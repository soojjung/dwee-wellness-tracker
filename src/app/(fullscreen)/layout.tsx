import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function FullscreenLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="mx-auto min-h-dvh w-full max-w-md">{children}</div>
    </AuthGuard>
  );
}
