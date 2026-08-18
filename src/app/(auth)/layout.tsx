import type { ReactNode } from 'react';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#FDE2EF',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-dvh w-full max-w-md bg-auth-bg">{children}</div>;
}
