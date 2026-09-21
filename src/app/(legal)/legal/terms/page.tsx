import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicTermsScreen } from '@/components/legal/PublicTermsScreen';

export const metadata: Metadata = { title: 'Terms of Service · dwee' };

// Suspense: the screen reads `?lang=` with useSearchParams, which a static
// export can only resolve on the client.
export default function PublicTermsPage() {
  return (
    <Suspense>
      <PublicTermsScreen />
    </Suspense>
  );
}
