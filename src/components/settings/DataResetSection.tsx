'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { resetAllUserData } from '@/data';

export function DataResetSection() {
  const t = useT();
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    if (typeof window === 'undefined') return;
    if (!window.confirm(t.settings.dataResetConfirm)) return;
    setResetting(true);
    await resetAllUserData();
    // 전체 리로드로 모든 store 초기화 + 홈 빈 상태 진입.
    window.location.assign('/');
  }

  return (
    <section className="flex flex-col gap-2">
      <span className="text-sm font-medium text-brand-gray900">{t.settings.dataReset}</span>
      <p className="text-xs text-brand-gray600">{t.settings.dataResetHint}</p>
      <Button variant="secondary" size="md" onClick={handleReset} disabled={resetting}>
        {t.settings.dataResetButton}
      </Button>
    </section>
  );
}
