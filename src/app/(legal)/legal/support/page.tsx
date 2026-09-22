import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicSupportScreen } from '@/components/legal/PublicSupportScreen';

export const metadata: Metadata = { title: 'Support · dwee' };

// Suspense: the screen reads `?lang=` with useSearchParams, which a static
// export can only resolve on the client.
export default function PublicSupportPage() {
  return (
    <Suspense>
      <PublicSupportScreen />
    </Suspense>
  );
}
