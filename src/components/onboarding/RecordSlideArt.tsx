'use client';
import type { ReactNode } from 'react';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { PALETTE } from '@/domain/event/palette';
import { CancelIcon } from '@/components/ui/icons/CancelIcon';
import { CheckIcon } from '@/components/ui/icons/CheckIcon';
import { ChevronDownIcon } from '@/components/ui/icons/ChevronDownIcon';

// Figma 821:5119 — "일정 및 기록" 시트를 0.7436배로 줄여 넣은 목업.
// 실제 시트 치수(390 폭, 16px 패딩)로 그린 뒤 통째로 줄여야 값이 깔끔하다.
const MOCK_SCALE = 290 / 390;

export function RecordSlideArt() {
  const t = useT();
  const sheet = t.report.diary.eventSheet;
  const sample = t.onboarding.sample;
  const c = t.condition;

  return (
    <>
      <div
        className="absolute left-[50px] top-[24px] w-[390px] origin-top-left overflow-hidden rounded-t-[32px] bg-brand-gray200 shadow-[0_5px_20px_rgba(0,0,0,0.15)]"
        style={{ transform: `scale(${MOCK_SCALE})`, height: 790 }}
      >
        <div className="flex items-center justify-between p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gray300 text-brand-gray900">
            <CancelIcon className="h-6 w-6" />
          </span>
          <p className="text-xl font-semibold text-brand-gray900">{sheet.title}</p>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-pink200 text-brand-gray50">
            <CheckIcon className="h-6 w-6" />
          </span>
        </div>

        <div className="flex flex-col gap-6 px-4">
          <div className="overflow-hidden rounded-lg bg-brand-gray50">
            <p className="border-b border-brand-gray200 px-5 py-3.5 text-lg font-semibold text-brand-gray900">
              {sample.eventTitle}
            </p>
            <p className="px-5 pb-12 pt-3.5 text-base text-brand-gray900">{sample.eventMemo}</p>
          </div>

          <div className="overflow-hidden rounded-lg bg-brand-gray50">
            <Row label={sheet.startDate} className="border-b border-brand-gray200">
              <DateValue value={sample.eventDate} />
            </Row>
            <Row label={sheet.endDate}>
              <DateValue value={sample.eventDate} />
            </Row>
          </div>

          <Row label={sheet.category} className="rounded-lg bg-brand-gray50">
            <span
              className="rounded-full px-2 py-[3px] text-sm font-medium text-brand-gray900"
              style={{ backgroundColor: PALETTE.lavender.bg }}
            >
              {t.report.diary.eventCategory.builtin.friend}
            </span>
            <ChevronDownIcon className="h-[18px] w-[18px] rotate-180 p-[3px] text-brand-gray900" />
          </Row>

          <Row
            label={t.report.diary.eventDetail.periodToggle}
            className="rounded-lg bg-brand-gray50"
          >
            <span className="flex h-6 w-[50px] items-center justify-end rounded-full bg-brand-pink100 p-0.5">
              <span className="h-5 w-[30px] rounded-full bg-brand-gray50" />
            </span>
          </Row>

          <div className="flex flex-col gap-[18px] rounded-2xl bg-brand-gray50 px-4 py-3.5">
            <p className="text-base text-brand-gray600">{sheet.conditionLabel}</p>
            <div className="flex flex-col gap-5">
              <ChipGroup label={t.log.todayMood} options={Object.values(c.mood)} selected={2} />
              <ChipGroup label={t.log.todayEnergy} options={Object.values(c.energy)} />
              <ChipGroup label={t.log.todayPain} options={Object.values(c.pain)} selected={2} />
              <ChipGroup label={t.log.todayBloating} options={Object.values(c.bloating)} />
            </div>
          </div>
        </div>
      </div>

      {/* 시트 아랫부분이 버튼 쪽으로 사라지듯 흐려진다 (Figma 832:5585). 화면이 시안보다
          길면 무대 아래로도 시트가 이어지므로, 흐림이 끝난 뒤는 배경색으로 계속 덮는다. */}
      <div className="absolute inset-x-0 top-[449px] h-[103px] bg-gradient-to-b from-brand-gray50/0 to-brand-gray50" />
      <div className="absolute inset-x-0 top-[552px] h-[400px] bg-brand-gray50" />
    </>
  );
}

function Row({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex items-center gap-2.5 px-5 py-3.5', className)}>
      <p className="min-w-0 flex-1 text-base text-brand-gray600">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function DateValue({ value }: { value: string }) {
  return (
    <>
      <span className="text-base font-medium text-brand-gray900">{value}</span>
      <ChevronDownIcon className="h-[18px] w-[18px] rotate-180 p-[3px] text-brand-gray900" />
    </>
  );
}

function ChipGroup({
  label,
  options,
  selected,
}: {
  label: string;
  options: string[];
  selected?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-medium text-brand-gray900">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((option, i) => (
          <span
            key={option}
            className={cn(
              'whitespace-nowrap rounded-full px-3 py-2 text-sm',
              i === selected
                ? 'bg-brand-gray900 text-brand-gray50'
                : 'border border-brand-gray300 text-brand-gray600',
            )}
          >
            {option}
          </span>
        ))}
      </div>
    </div>
  );
}
