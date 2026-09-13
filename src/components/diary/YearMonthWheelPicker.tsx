'use client';
import { useMemo, useState, type ReactNode } from 'react';
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
  const changed = year !== initialYear || monthIndex !== initialMonthIndex;

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
            ? `${String(i + 1).padStart(2, '0')}${t.report.diary.yearMonthPicker.monthSuffix}`
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
        className="flex w-full max-w-md flex-col rounded-t-3xl bg-brand-white pb-6 shadow-[0_-8px_32px_0_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Figma 311:2130 header — same shape as the event sheet header:
            circular X (left), centered 20px title, circular ✓ (right). */}
        <header className="relative flex items-center justify-between px-4 pt-4 pb-3">
          <button
            type="button"
            onClick={onCancel}
            aria-label={t.report.diary.yearMonthPicker.cancel}
            className="grid size-10 place-items-center rounded-full bg-brand-gray100 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <CloseIcon />
          </button>
          <h3 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold text-brand-gray900">
            {t.report.diary.yearMonthPicker.title}
          </h3>
          <button
            type="button"
            onClick={() => onApply(year, monthIndex)}
            disabled={!changed}
            aria-label={t.report.diary.yearMonthPicker.confirm}
            className={
              'grid size-10 place-items-center rounded-full text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
              (changed ? 'bg-brand-pink200' : 'bg-brand-gray400')
            }
          >
            <CheckIcon />
          </button>
        </header>

        {/* Two 104px columns with a pink underline beneath the centred row
            of each (Figma 311:2130). The underline sits at the bottom edge of
            the selected row: 50% + half an item, minus its own 1px. */}
        <div className="mx-auto flex h-56 w-[228px] gap-6">
          <WheelSlot>
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
              className="h-full"
            />
          </WheelSlot>
          <WheelSlot>
            <WheelColumn
              items={months.map((m) => ({ key: m.index, label: m.label }))}
              selectedKey={monthIndex}
              onSelectKey={(k) => setMonthIndex(k as number)}
              className="h-full"
            />
          </WheelSlot>
        </div>
      </div>
    </div>
  );
}

function WheelSlot({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-w-0 flex-1">
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-0.5 rounded-full bg-brand-pink300"
        style={{ top: `calc(50% + ${ITEM_HEIGHT / 2 - 2}px)` }}
      />
    </div>
  );
}

// Figma 311:2130 draws a 12px X and a 14px check with a 2px stroke inside
// the 40px circles — noticeably bigger than the shared 16px icons.
function CloseIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="size-3"
      aria-hidden
    >
      <path d="M1 1l10 10M11 1L1 11" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 14 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3.5"
      aria-hidden
    >
      <path d="M1 6.5l4 4L13 1.5" />
    </svg>
  );
}
