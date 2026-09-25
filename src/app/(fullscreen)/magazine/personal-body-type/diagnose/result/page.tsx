import { Suspense } from 'react';
import { DiagnoseResultScreen } from '@/components/diagnose/DiagnoseResultScreen';

// Suspense: the screen reads `?from=` with useSearchParams, which a static
// export can only resolve on the client.
export default function ResultPage() {
  return (
    <Suspense>
      <DiagnoseResultScreen />
    </Suspense>
  );
}
