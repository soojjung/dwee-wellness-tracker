import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-dvh w-full max-w-md">{children}</div>;
}
