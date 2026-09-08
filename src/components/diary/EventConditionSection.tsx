'use client';
import { useT } from '@/i18n/useT';
import {
  MOOD_VALUES,
  ENERGY_VALUES,
  PAIN_VALUES,
  BLOATING_VALUES,
  APPETITE_VALUES,
  SKIN_VALUES,
} from '@/constants/conditionOptions';
import type { Mood, Energy, Pain, Bloating, Appetite, Skin } from '@/types';
import { ConditionRow } from '@/components/log/ConditionRow';

/** Subset of `DailyConditionLog` this sheet can set — only present when
 * at least one field was picked (see `EventFormSheet`). */
export interface ConditionSelection {
  mood?: Mood;
  energy?: Energy;
  pain?: Pain;
  bloating?: Bloating;
  appetite?: Appetite;
  skin?: Skin;
}

interface EventConditionSectionProps {
  mood: Mood | null;
  energy: Energy | null;
  pain: Pain | null;
  bloating: Bloating | null;
  appetite: Appetite | null;
  skin: Skin | null;
  onChangeMood: (value: Mood) => void;
  onChangeEnergy: (value: Energy) => void;
  onChangePain: (value: Pain) => void;
  onChangeBloating: (value: Bloating) => void;
  onChangeAppetite: (value: Appetite) => void;
  onChangeSkin: (value: Skin) => void;
}

/**
 * Figma 012_2 — optional condition card inside `EventFormSheet`. Rows reuse
 * `ConditionRow` (`variant="outline"`) with dwee's shared `MOOD_VALUES`…
 * `SKIN_VALUES` enums, so a selection here lands in the same
 * `DailyConditionLog` shape the today check-in (`LogEntryDialog`) writes.
 */
export function EventConditionSection({
  mood,
  energy,
  pain,
  bloating,
  appetite,
  skin,
  onChangeMood,
  onChangeEnergy,
  onChangePain,
  onChangeBloating,
  onChangeAppetite,
  onChangeSkin,
}: EventConditionSectionProps) {
  const t = useT();

  return (
    <div className="space-y-5 rounded-2xl bg-brand-white px-4 py-3.5">
      <h3 className="text-base font-normal text-brand-gray600">
        {t.report.diary.eventSheet.conditionLabel}
      </h3>
      <ConditionRow
        variant="outline"
        label={t.log.todayMood}
        values={MOOD_VALUES}
        labels={t.condition.mood}
        value={mood}
        onChange={onChangeMood}
      />
      <ConditionRow
        variant="outline"
        label={t.log.todayEnergy}
        values={ENERGY_VALUES}
        labels={t.condition.energy}
        value={energy}
        onChange={onChangeEnergy}
      />
      <ConditionRow
        variant="outline"
        label={t.log.todayPain}
        values={PAIN_VALUES}
        labels={t.condition.pain}
        value={pain}
        onChange={onChangePain}
      />
      <ConditionRow
        variant="outline"
        label={t.log.todayBloating}
        values={BLOATING_VALUES}
        labels={t.condition.bloating}
        value={bloating}
        onChange={onChangeBloating}
      />
      <ConditionRow
        variant="outline"
        label={t.log.todayAppetite}
        values={APPETITE_VALUES}
        labels={t.condition.appetite}
        value={appetite}
        onChange={onChangeAppetite}
      />
      <ConditionRow
        variant="outline"
        label={t.log.todaySkin}
        values={SKIN_VALUES}
        labels={t.condition.skin}
        value={skin}
        onChange={onChangeSkin}
      />
    </div>
  );
}
