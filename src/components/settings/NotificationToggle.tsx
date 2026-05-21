'use client';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/cn';

// TODO(MVP2): 실제 푸시 알림 연동 (FCM/APNs). 현재는 mock 토글 — 값만 저장.
export function NotificationToggle() {
  const t = useT();
  const enabled = useSettingsStore((s) => s.settings.notificationsEnabled);
  const update = useSettingsStore((s) => s.update);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brand-gray900">{t.settings.notifications}</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => update({ notificationsEnabled: !enabled })}
          className={cn(
            'relative h-7 w-12 rounded-full transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-1',
            enabled ? 'bg-brand-pink200' : 'bg-brand-gray300',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-6 w-6 rounded-full bg-brand-white shadow transition-transform',
              enabled ? 'translate-x-5' : 'translate-x-0.5',
            )}
          />
        </button>
      </div>
      <p className="text-xs text-brand-gray600">{t.settings.notificationsHint}</p>
    </section>
  );
}
