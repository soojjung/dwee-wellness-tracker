'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { MyPageToggle } from './MyPageToggle';
import { cn } from '@/lib/cn';

// Reminder lead-time range shown in the timing picker (0–14 days before).
const LEAD_DAY_MIN = 0;
const LEAD_DAY_MAX = 14;

export function NotificationsScreen() {
  const t = useT();
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const [timingOpen, setTimingOpen] = useState(false);

  const master = settings.notificationsEnabled;
  const periodDue = settings.notifPeriodDueEnabled;
  const periodDelay = settings.notifPeriodDelayEnabled;
  const fertile = settings.notifFertileEnabled;
  const leadDays = settings.notifPeriodDueLeadDays;

  // Spec (Figma 292:2765): turning master ON enables all sub-toggles; turning
  // master OFF disables all subs. When individual subs are toggled off and the
  // aggregate becomes false, we also flip master to false — screen collapses
  // back to state #1.
  const handleMasterToggle = () => {
    const next = !master;
    if (next) {
      update({
        notificationsEnabled: true,
        notifPeriodDueEnabled: true,
        notifPeriodDelayEnabled: true,
        notifFertileEnabled: true,
      });
    } else {
      update({
        notificationsEnabled: false,
        notifPeriodDueEnabled: false,
        notifPeriodDelayEnabled: false,
        notifFertileEnabled: false,
      });
      setTimingOpen(false);
    }
  };

  const toggleSub = (key: 'periodDue' | 'periodDelay' | 'fertile') => {
    const nextValues = {
      periodDue: key === 'periodDue' ? !periodDue : periodDue,
      periodDelay: key === 'periodDelay' ? !periodDelay : periodDelay,
      fertile: key === 'fertile' ? !fertile : fertile,
    };
    const anyOn =
      nextValues.periodDue || nextValues.periodDelay || nextValues.fertile;
    update({
      notifPeriodDueEnabled: nextValues.periodDue,
      notifPeriodDelayEnabled: nextValues.periodDelay,
      notifFertileEnabled: nextValues.fertile,
      notificationsEnabled: anyOn,
    });
    if (key === 'periodDue' && !nextValues.periodDue) setTimingOpen(false);
  };

  const timingValue =
    leadDays === 0
      ? t.myPage.notifications.periodDueTimingSameDay
      : `${t.myPage.notifications.periodDueTimingValuePrefix}${leadDays}${t.myPage.notifications.periodDueTimingValueSuffix}`;

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center bg-brand-gray200 px-4">
          <Link
            href="/settings"
            aria-label={t.myPage.notifications.backAriaLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <BackIcon />
          </Link>
        </header>

        <main className="flex flex-col gap-4 px-4 pb-24">
          <Card>
            <SimpleRow
              title={t.myPage.notifications.master}
              enabled={master}
              onToggle={handleMasterToggle}
            />
          </Card>

          {master ? (
            <>
              <Card>
                <DetailRow
                  title={t.myPage.notifications.periodDue.title}
                  subtitle={t.myPage.notifications.periodDue.subtitle}
                  enabled={periodDue}
                  onToggle={() => toggleSub('periodDue')}
                />
                {periodDue ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setTimingOpen((v) => !v)}
                      aria-expanded={timingOpen}
                      className="flex h-[52px] w-full items-center justify-between px-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gray900"
                    >
                      <span className="text-base text-brand-gray700">
                        {t.myPage.notifications.periodDueTiming}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-base font-medium text-brand-pink300">
                          {timingValue}
                        </span>
                        <ChevronIcon open={timingOpen} />
                      </span>
                    </button>
                    {timingOpen ? (
                      <LeadDaysWheel
                        value={leadDays}
                        onChange={(d) => update({ notifPeriodDueLeadDays: d })}
                        unit={t.myPage.notifications.periodDueTimingWheelUnit}
                        trailingLabel={t.myPage.notifications.periodDueTimingWheelTrailing}
                      />
                    ) : null}
                  </>
                ) : null}
              </Card>

              <Card>
                <DetailRow
                  title={t.myPage.notifications.periodDelay.title}
                  subtitle={t.myPage.notifications.periodDelay.subtitle}
                  enabled={periodDelay}
                  onToggle={() => toggleSub('periodDelay')}
                />
              </Card>

              <Card>
                <DetailRow
                  title={t.myPage.notifications.fertile.title}
                  subtitle={t.myPage.notifications.fertile.subtitle}
                  enabled={fertile}
                  onToggle={() => toggleSub('fertile')}
                />
              </Card>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-brand-white">
      {children}
    </section>
  );
}

interface SimpleRowProps {
  title: string;
  enabled: boolean;
  onToggle: () => void;
}

function SimpleRow({ title, enabled, onToggle }: SimpleRowProps) {
  return (
    <div className="flex h-[52px] items-center justify-between px-5">
      <span className="text-base font-medium text-brand-gray900">{title}</span>
      <MyPageToggle enabled={enabled} onToggle={onToggle} ariaLabel={title} />
    </div>
  );
}

interface DetailRowProps {
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
}

function DetailRow({ title, subtitle, enabled, onToggle }: DetailRowProps) {
  return (
    <div className="flex min-h-[72px] items-center justify-between gap-3 px-5 py-3.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-base font-medium leading-tight text-brand-gray900">
          {title}
        </span>
        <span className="text-xs leading-tight text-brand-gray600">
          {subtitle}
        </span>
      </div>
      <MyPageToggle enabled={enabled} onToggle={onToggle} ariaLabel={title} />
    </div>
  );
}

interface LeadDaysWheelProps {
  value: number;
  onChange: (days: number) => void;
  /** Unit marker appended to the number ('일' in ko, '' in en). */
  unit: string;
  /** Static right-column label ('전 알림' in ko, 'days before' in en). */
  trailingLabel: string;
}

/**
 * 3-row wheel-style picker matching Figma 292:2721. Center row is the current
 * value with pink borders top/bottom; prev/next rows show ±1 in faded gray and
 * are tap-to-select (single-step increment/decrement). Right column shows a
 * static locale-appropriate trailing label aligned with the center row.
 * At value=0 the entire "0일 전 알림" phrase turns pink (Figma spec #3).
 */
function LeadDaysWheel({ value, onChange, unit, trailingLabel }: LeadDaysWheelProps) {
  const prev = value - 1;
  const next = value + 1;
  const hasPrev = prev >= LEAD_DAY_MIN;
  const hasNext = next <= LEAD_DAY_MAX;
  const isZero = value === 0;

  const numberLabel = (n: number) => `${n}${unit}`;

  return (
    <div className="py-3.5">
      <div className="mx-auto grid w-52 grid-cols-2">
        {/* Numbers column */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => hasPrev && onChange(prev)}
            disabled={!hasPrev}
            aria-label={hasPrev ? numberLabel(prev) : ''}
            className="flex h-11 items-center justify-center text-base text-brand-gray400 transition-colors hover:text-brand-gray600 disabled:opacity-0"
          >
            {hasPrev ? numberLabel(prev) : ''}
          </button>
          <div
            className={cn(
              'flex h-11 items-center justify-center border-y border-brand-pink200 text-base',
              isZero ? 'text-brand-pink300' : 'text-brand-gray900',
            )}
          >
            {numberLabel(value)}
          </div>
          <button
            type="button"
            onClick={() => hasNext && onChange(next)}
            disabled={!hasNext}
            aria-label={hasNext ? numberLabel(next) : ''}
            className="flex h-11 items-center justify-center text-base text-brand-gray400 transition-colors hover:text-brand-gray600 disabled:opacity-0"
          >
            {hasNext ? numberLabel(next) : ''}
          </button>
        </div>

        {/* Trailing label column ("전 알림" / "days before") */}
        <div className="flex flex-col">
          <div className="h-11" />
          <div
            className={cn(
              'flex h-11 items-center justify-center border-y border-brand-pink200 text-base',
              isZero ? 'text-brand-pink300' : 'text-brand-gray900',
            )}
          >
            {trailingLabel}
          </div>
          <div className="h-11" />
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        'h-4 w-4 text-brand-pink300 transition-transform',
        open ? 'rotate-180' : 'rotate-0',
      )}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
