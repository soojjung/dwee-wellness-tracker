'use client';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { formatFullDate } from '@/lib/date';
import type { DailyConditionLog, EventCategory, EventLog, Locale } from '@/types';
import { BackIcon } from '@/components/ui/icons';
import { CategoryChip } from './CategoryChip';
import { conditionRowsOf } from './eventDetailRows';

interface EventDetailScreenProps {
  event: EventLog;
  category: EventCategory | null;
  /** 시작일의 컨디션 기록. 기록된 항목이 하나도 없으면 컨디션 카드를 숨긴다. */
  condition: DailyConditionLog | null;
  locale: Locale;
  onBack: () => void;
  onEdit: () => void;
}

// 일정 상세 (Figma 012_7, 256:17617). 읽기 전용 — 편집은 [편집] 으로 여는 시트에서만.
// 다이어리 위에 풀스크린으로 겹치고, 편집 시트(z-40)가 그 위에 다시 겹친다.
export function EventDetailScreen({
  event,
  category,
  condition,
  locale,
  onBack,
  onEdit,
}: EventDetailScreenProps) {
  const t = useT();
  const d = t.report.diary.eventDetail;
  useBodyScrollLock();
  useEscToClose(onBack);

  const conditionRows = conditionRowsOf(condition, t);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      className="fixed inset-0 z-30 flex flex-col bg-brand-gray200"
    >
      <div className="flex h-full w-full max-w-md flex-col self-center overflow-hidden">
        <header className="flex items-center justify-between px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]">
          <button
            type="button"
            onClick={onBack}
            aria-label={d.back}
            className="grid size-10 place-items-center rounded-full bg-brand-gray400/50 text-brand-gray900 backdrop-blur-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <BackIcon className="size-10" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full bg-brand-gray400/40 px-3.5 py-2 text-base leading-normal text-brand-gray900 backdrop-blur-[2px] transition-colors hover:bg-brand-gray400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            {d.edit}
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-2">
          <h1 className="text-2xl font-semibold leading-normal text-brand-gray900">
            {formatFullDate(event.startDate, locale)}
          </h1>

          <section className="overflow-hidden rounded-lg bg-brand-white">
            <p className="border-b border-brand-gray200 px-5 py-3.5 text-lg font-semibold leading-normal text-brand-gray900">
              {event.title}
            </p>
            {event.memo ? (
              <p className="whitespace-pre-line px-5 pb-12 pt-3.5 text-base leading-normal text-brand-gray800">
                {event.memo}
              </p>
            ) : null}
          </section>

          <div className="flex flex-col gap-4 pt-2">
            <DetailRow label={d.typeLabel}>
              {category ? (
                <CategoryChip name={category.name} colorId={category.colorId} size="md" />
              ) : null}
            </DetailRow>
            <DetailRow label={d.periodToggle}>
              <span className="text-base font-medium leading-normal text-brand-gray900">
                {event.hasPeriodMark ? d.periodOn : d.periodOff}
              </span>
            </DetailRow>
          </div>

          {conditionRows.length > 0 ? (
            <section className="mt-2 flex flex-col gap-[18px] rounded-2xl bg-brand-white px-4 py-3.5">
              <p className="text-base leading-normal text-brand-gray600">{d.conditionLabel}</p>
              {conditionRows.map((row) => (
                <div key={row.label} className="flex items-center gap-2.5">
                  <span className="text-base leading-normal text-brand-gray900">{row.label}</span>
                  <span aria-hidden className="h-[15px] w-px bg-brand-gray400" />
                  <span className="text-base font-medium leading-normal text-brand-gray900">
                    {row.value}
                  </span>
                </div>
              ))}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
}

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-2.5 rounded-lg bg-brand-white px-5 py-3.5">
      <span className="text-base leading-normal text-brand-gray600">{label}</span>
      {children}
    </div>
  );
}
