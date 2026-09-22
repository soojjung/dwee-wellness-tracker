import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicPrivacyScreen } from '@/components/legal/PublicPrivacyScreen';

export const metadata: Metadata = { title: 'Privacy Policy · dwee' };

// Suspense: the screen reads `?lang=` with useSearchParams, which a static
// export can only resolve on the client.
export default function PublicPrivacyPage() {
  return (
    <Suspense>
      <PublicPrivacyScreen />
    </Suspense>
  );
}
