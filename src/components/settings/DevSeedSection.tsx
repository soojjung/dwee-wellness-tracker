'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';

const IS_DEV = process.env.NODE_ENV === 'development';

export function DevSeedSection() {
  const t = useT();
  const [busy, setBusy] = useState(false);

  if (!IS_DEV) return null;

  async function handleSeed() {
    setBusy(true);
    try {
      const { seedDevData } = await import('@/dev/seedData');
      await seedDevData();
      window.location.assign('/');
    } catch (e) {
      setBusy(false);
      // eslint-disable-next-line no-console
      console.error('seed failed', e);
    }
  }

  return (
    <section className="flex flex-col gap-2 rounded-lg border border-dashed border-brand-gray400 p-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-gray600">
        {t.settings.devSection}
      </span>
      <p className="text-xs text-brand-gray600">{t.settings.devSeedHint}</p>
      <Button variant="secondary" size="sm" onClick={handleSeed} disabled={busy}>
        {busy ? t.settings.devSeedBusy : t.settings.devSeedButton}
      </Button>
    </section>
  );
}
