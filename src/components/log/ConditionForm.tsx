'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useConditionStore } from '@/store/conditionStore';
import { todayISO } from '@/lib/date';
import {
  MOOD_VALUES,
  ENERGY_VALUES,
  PAIN_VALUES,
  BLOATING_VALUES,
  APPETITE_VALUES,
  SKIN_VALUES,
} from '@/constants/conditionOptions';
import type {
  Mood,
  Energy,
  Pain,
  Bloating,
  Appetite,
  Skin,
  DailyConditionLog,
} from '@/types';
import { ConditionRow } from './ConditionRow';
import { ConditionSavedBadge } from './ConditionSavedBadge';

const TOAST_MS = 2400;
const MEMO_MAX = 200;

interface FormState {
  mood: Mood | null;
  energy: Energy | null;
  pain: Pain | null;
  bloating: Bloating | null;
  appetite: Appetite | null;
  skin: Skin | null;
  memo: string;
}

const EMPTY_STATE: FormState = {
  mood: null,
  energy: null,
  pain: null,
  bloating: null,
  appetite: null,
  skin: null,
  memo: '',
};

function fromLog(log: DailyConditionLog): FormState {
  return {
    mood: log.mood ?? null,
    energy: log.energy ?? null,
    pain: log.pain ?? null,
    bloating: log.bloating ?? null,
    appetite: log.appetite ?? null,
    skin: log.skin ?? null,
    memo: log.memo ?? '',
  };
}

export function ConditionForm() {
  const t = useT();
  const today = todayISO();

  const hydrateRange = useConditionStore((s) => s.hydrateRange);
  const upsert = useConditionStore((s) => s.upsert);
  const todayLog = useConditionStore((s) => s.byDate[today] ?? null);
  const loading = useConditionStore((s) => s.loading);
  const error = useConditionStore((s) => s.error);

  const [form, setForm] = useState<FormState>(EMPTY_STATE);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    hydrateRange(today, today);
  }, [hydrateRange, today]);

  useEffect(() => {
    if (!dirty && todayLog) setForm(fromLog(todayLog));
  }, [todayLog, dirty]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setDirty(true);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const saved = await upsert({
      date: today,
      ...(form.mood ? { mood: form.mood } : {}),
      ...(form.energy ? { energy: form.energy } : {}),
      ...(form.pain ? { pain: form.pain } : {}),
      ...(form.bloating ? { bloating: form.bloating } : {}),
      ...(form.appetite ? { appetite: form.appetite } : {}),
      ...(form.skin ? { skin: form.skin } : {}),
      ...(form.memo.trim() ? { memo: form.memo.trim() } : {}),
    });
    setSubmitting(false);
    if (saved) {
      setDirty(false);
      setToast(t.log.saved);
    }
  }

  if (loading && !todayLog) {
    return (
      <PageContainer>
        <p className="text-sm text-neutral-500">{t.log.loadingLabel}</p>
      </PageContainer>
    );
  }
  if (error) {
    return (
      <PageContainer>
        <p className="text-sm text-neutral-500">{t.log.errorLabel}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="gap-6 pb-32">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900">{t.log.title}</h1>
        {todayLog ? <ConditionSavedBadge /> : null}
      </header>

      <ConditionRow label={t.log.todayMood} values={MOOD_VALUES} labels={t.condition.mood} value={form.mood} onChange={(v) => update('mood', v)} />
      <ConditionRow label={t.log.todayEnergy} values={ENERGY_VALUES} labels={t.condition.energy} value={form.energy} onChange={(v) => update('energy', v)} />
      <ConditionRow label={t.log.todayPain} values={PAIN_VALUES} labels={t.condition.pain} value={form.pain} onChange={(v) => update('pain', v)} />
      <ConditionRow label={t.log.todayBloating} values={BLOATING_VALUES} labels={t.condition.bloating} value={form.bloating} onChange={(v) => update('bloating', v)} />
      <ConditionRow label={t.log.todayAppetite} values={APPETITE_VALUES} labels={t.condition.appetite} value={form.appetite} onChange={(v) => update('appetite', v)} />
      <ConditionRow label={t.log.todaySkin} values={SKIN_VALUES} labels={t.condition.skin} value={form.skin} onChange={(v) => update('skin', v)} />

      <label className="flex flex-col gap-2">
        <textarea
          value={form.memo}
          maxLength={MEMO_MAX}
          placeholder={t.log.memoPlaceholder}
          onChange={(e) => update('memo', e.target.value)}
          className="min-h-[88px] resize-none rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-2"
        />
      </label>

      <Button size="lg" fullWidth onClick={handleSubmit} disabled={submitting}>
        {submitting ? t.log.saving : t.log.save}
      </Button>

      <Toast message={toast} />
    </PageContainer>
  );
}
