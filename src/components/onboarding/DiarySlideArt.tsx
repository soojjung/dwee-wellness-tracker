'use client';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { PALETTE } from '@/domain/event/palette';
import { EditStarIcon } from '@/components/ui/icons/EditStarIcon';

// Figma 832:5209 — 다이어리 캘린더(358 폭)를 0.81배로 줄인 목업 + 기본 스티커.
const MOCK_SCALE = 290 / 358;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// 시안 속 달(2026년 6월, 월요일 시작). 목업이라 날짜 계산 없이 고정값으로 둔다.
const WEEKS: Array<Array<number | null>> = [
  [null, 1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12, 13],
  [14, 15, 16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25, 26, 27],
  [28, 29, 30, null, null, null, null],
];
const PERIOD_DAYS = new Set([5, 6, 7, 8, 9]);
const TODAY = 18;

export function DiarySlideArt() {
  const t = useT();
  const chips = t.onboarding.sample.chips;

  return (
    <>
      <div
        className="absolute left-[51.5px] top-[42px] w-[358px] origin-top-left rounded-2xl bg-brand-gray50/95 py-2 shadow-[0_5px_27px_rgba(0,0,0,0.15)]"
        style={{ transform: `scale(${MOCK_SCALE})` }}
      >
        <div className="flex py-2 text-center text-xs font-medium">
          {WEEKDAY_KEYS.map((key, i) => (
            <p
              key={key}
              className={cn(
                'flex-1',
                i === 0 || i === 6 ? 'text-brand-gray500' : 'text-brand-gray700',
              )}
            >
              {t.calendar.weekdays[key]}
            </p>
          ))}
        </div>

        <div className="relative flex flex-col gap-[72px] pb-[72px]">
          {WEEKS.map((week, w) => (
            <div key={w} className="flex border-t border-brand-gray400 pt-2">
              {week.map((day, d) => (
                <div key={d} className="flex flex-1 justify-center">
                  {day !== null && <DayNumber day={day} />}
                </div>
              ))}
            </div>
          ))}

          <EventChip label={chips.plans} color="lavender" className="left-[105px] top-[130px]" />
          <EventChip label={chips.meeting} color="gray" className="left-[156px] top-[130px]" />
          <EventChip
            label={chips.dinner}
            color="lavender"
            className="left-[54px] top-[229px] w-[46px]"
          />
          <EventChip
            label={chips.ourApp}
            color="gray"
            className="left-[54px] top-[250px] w-[46px]"
          />
          <EventChip
            label={chips.rocks}
            color="gray"
            className="left-[54px] top-[271px] w-[46px]"
          />
        </div>
      </div>

      <Sticker
        src="/stickers/default/matcha.png"
        className="left-[306px] top-[90px] h-[66px] w-[56px] rotate-[30deg]"
      />
      <Sticker
        src="/stickers/default/avocado-toast.png"
        className="left-[289px] top-[323px] h-[81px] w-[83px]"
      />
      <Sticker
        src="/stickers/default/workout.png"
        cover
        className="left-[220px] top-[373px] h-[110px] w-[83px] rotate-[15deg] rounded-md"
      />
      <Sticker
        src="/stickers/default/airpods-max.png"
        className="left-[25px] top-[141px] h-[91px] w-[87px] -rotate-[15deg]"
      />

      <span className="absolute left-[65px] top-[15px] flex h-10 w-10 items-center justify-center rounded-full bg-brand-pink50 text-brand-gray900">
        <EditStarIcon className="h-6 w-6" />
      </span>
    </>
  );
}

function DayNumber({ day }: { day: number }) {
  const marked = PERIOD_DAYS.has(day) || day === TODAY;
  return (
    <span
      className={cn(
        'flex h-[19px] items-center justify-center text-base font-medium leading-none',
        marked && 'w-8 rounded-full',
        PERIOD_DAYS.has(day) && 'bg-brand-pink50 text-brand-pink800',
        day === TODAY && 'bg-brand-gray900 text-brand-gray50',
        !marked && 'text-brand-gray900',
      )}
    >
      {day}
    </span>
  );
}

function EventChip({
  label,
  color,
  className,
}: {
  label: string;
  color: 'lavender' | 'gray';
  className: string;
}) {
  return (
    <p
      className={cn(
        'absolute overflow-hidden whitespace-nowrap rounded p-0.5 text-xs font-medium leading-[normal] text-brand-gray900',
        className,
      )}
      style={{ backgroundColor: PALETTE[color].bg }}
    >
      {label}
    </p>
  );
}

function Sticker({ src, className, cover }: { src: string; className: string; cover?: boolean }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={cn('absolute select-none', cover ? 'object-cover' : 'object-contain', className)}
    />
  );
}
