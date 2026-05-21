'use client';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/settingsStore';

const MIN_CYCLE = 15;
const MAX_CYCLE = 60;

export function CycleLengthEditor() {
  const t = useT();
  const cycle = useSettingsStore((s) => s.settings.averageCycleLength);
  const update = useSettingsStore((s) => s.update);

  const adjust = (delta: number) => {
    const next = Math.min(MAX_CYCLE, Math.max(MIN_CYCLE, cycle + delta));
    if (next !== cycle) update({ averageCycleLength: next });
  };

  return (
    <section className="flex flex-col gap-2">
      <span className="text-sm font-medium text-brand-gray900">{t.settings.cycleLength}</span>
      <div className="flex items-center justify-between rounded-lg border border-brand-gray300 bg-brand-white px-2 py-1">
        <Button variant="ghost" size="sm" aria-label={t.onboarding.decrease} onClick={() => adjust(-1)}>
          −
        </Button>
        <span className="text-base font-semibold tabular-nums text-brand-gray900">
          {cycle}
          <span className="ml-1 text-xs font-normal text-brand-gray600">{t.onboarding.cycleLengthUnit}</span>
        </span>
        <Button variant="ghost" size="sm" aria-label={t.onboarding.increase} onClick={() => adjust(1)}>
          +
        </Button>
      </div>
      <p className="text-xs text-brand-gray600">{t.settings.cycleLengthHint}</p>
    </section>
  );
}
