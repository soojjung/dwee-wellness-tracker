'use client';
import { useMemo, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { WheelColumn, WHEEL_ITEM_HEIGHT as ITEM_HEIGHT } from '@/components/ui/WheelColumn';

const YEAR_SPAN = 20;

interface YearMonthWheelPickerProps {
  initialYear: number;
  initialMonthIndex: number;
  onCancel: () => void;
  onApply: (year: number, monthIndex: number) => void;
}

export function YearMonthWheelPicker({
  initialYear,
  initialMonthIndex,
  onCancel,
  onApply,
}: YearMonthWheelPickerProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const [year, setYear] = useState(initialYear);
  const [monthIndex, setMonthIndex] = useState(initialMonthIndex);

  const years = useMemo(() => {
    const centerYear = new Date().getFullYear();
    return Array.from({ length: YEAR_SPAN * 2 + 1 }, (_, i) => centerYear - YEAR_SPAN + i);
  }, []);
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        index: i,
        label:
          locale === 'ko'
            ? `${i + 1}${t.report.diary.yearMonthPicker.monthSuffix}`
            : new Date(2000, i, 1).toLocaleString('en', { month: 'short' }),
      })),
    [locale, t],
  );

  useBodyScrollLock();
  useEscToClose(onCancel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.report.diary.yearMonthPicker.title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="flex w-full max-w-md flex-col rounded-t-3xl bg-brand-white pb-4 shadow-[0_-8px_32px_0_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="pb-2 pt-4 text-center text-base font-semibold text-brand-gray900">
          {t.report.diary.yearMonthPicker.title}
        </h3>

        <div className="relative flex h-56 gap-4 px-8">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-1/2 -translate-y-1/2"
            style={{ height: ITEM_HEIGHT }}
          >
            <span className="block h-px bg-brand-pink300" style={{ marginTop: 0 }} />
            <span
              className="block h-px bg-brand-pink300"
              style={{ marginTop: ITEM_HEIGHT - 1 }}
            />
          </span>
          <WheelColumn
            items={years.map((y) => ({
              key: y,
              label:
                locale === 'ko'
                  ? `${y}${t.report.diary.yearMonthPicker.yearSuffix}`
                  : String(y),
            }))}
            selectedKey={year}
            onSelectKey={(k) => setYear(k as number)}
          />
          <WheelColumn
            items={months.map((m) => ({ key: m.index, label: m.label }))}
            selectedKey={monthIndex}
            onSelectKey={(k) => setMonthIndex(k as number)}
          />
        </div>

        <div className="flex gap-2 border-t border-brand-gray300 px-4 pb-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl bg-brand-gray400/40 px-4 py-3 text-base font-medium text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            {t.report.diary.yearMonthPicker.cancel}
          </button>
          <button
            type="button"
            onClick={() => onApply(year, monthIndex)}
            className="flex-1 rounded-2xl bg-brand-gray900 px-4 py-3 text-base font-medium text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            {t.report.diary.yearMonthPicker.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
