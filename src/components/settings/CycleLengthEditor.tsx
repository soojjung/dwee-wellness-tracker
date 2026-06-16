'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/settingsStore';

const MIN_CYCLE = 15;
const MAX_CYCLE = 60;

export function CycleLengthEditor() {
  const t = useT();
  const cycle = useSettingsStore((s) => s.settings.averageCycleLength);
  const update = useSettingsStore((s) => s.update);
  const [draft, setDraft] = useState(cycle);
  const [saving, setSaving] = useState(false);

  // Keep draft in sync when the store value changes from elsewhere
  // (settings rehydrate after sign-in, another tab, etc.).
  useEffect(() => {
    setDraft(cycle);
  }, [cycle]);

  const adjust = (delta: number) => {
    setDraft((prev) => Math.min(MAX_CYCLE, Math.max(MIN_CYCLE, prev + delta)));
  };

  const isDirty = draft !== cycle;

  async function handleSave() {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      await update({ averageCycleLength: draft });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <span className="text-sm font-medium text-brand-gray900">{t.settings.cycleLength}</span>
      <div className="flex items-center justify-between rounded-lg border border-brand-gray300 bg-brand-white px-2 py-1">
        <Button variant="ghost" size="sm" aria-label={t.onboarding.decrease} onClick={() => adjust(-1)}>
          −
        </Button>
        <span className="text-base font-semibold tabular-nums text-brand-gray900">
          {draft}
          <span className="ml-1 text-xs font-normal text-brand-gray600">{t.onboarding.cycleLengthUnit}</span>
        </span>
        <Button variant="ghost" size="sm" aria-label={t.onboarding.increase} onClick={() => adjust(1)}>
          +
        </Button>
      </div>
      <p className="text-xs text-brand-gray600">{t.settings.cycleLengthHint}</p>
      <Button
        variant="secondary"
        size="md"
        onClick={handleSave}
        disabled={!isDirty || saving}
      >
        {saving ? t.settings.cycleLengthSaving : t.settings.cycleLengthSave}
      </Button>
    </section>
  );
}
