'use client';
import { useT } from '@/i18n/useT';

export function ConditionSavedBadge() {
  const t = useT();
  return (
    <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
      {t.log.savedBadge}
    </span>
  );
}
