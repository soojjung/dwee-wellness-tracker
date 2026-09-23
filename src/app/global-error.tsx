'use client';
import { useEffect } from 'react';
import { captureException } from '@/lib/monitoring/sentry';
import { dictionaries } from '@/i18n';
import { detectInitialLocale } from '@/i18n/detectLocale';

/**
 * Last-resort boundary for errors thrown in the root layout. It renders
 * outside every provider (no settings store), so the locale comes from the
 * device and the copy is read from the dictionaries directly.
 */
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const t = dictionaries[detectInitialLocale()].crash;

  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-brand-gray200 text-neutral-900 antialiased">
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-lg font-semibold">{t.title}</h1>
          <p className="text-sm leading-[1.6] text-brand-gray900/70">{t.body}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 rounded-full bg-brand-pink200 px-6 py-2.5 text-sm font-semibold text-brand-white"
          >
            {t.reload}
          </button>
        </main>
      </body>
    </html>
  );
}
