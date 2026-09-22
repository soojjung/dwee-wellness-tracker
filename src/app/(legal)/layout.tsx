import type { ReactNode } from 'react';

// Public routes: no AuthGuard. The App Store privacy-policy URL, the OAuth
// consent screens and reviewers all land here without a session.
export default function LegalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
