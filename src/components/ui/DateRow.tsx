import { formatDateShort } from '@/lib/date';
import { ChevronDownIcon } from '@/components/ui/icons';

export interface DateRowProps {
  label: string;
  value: string;
  locale: 'en' | 'ko';
  expanded: boolean;
  onToggle: () => void;
}

/** Shared date row: label + short-formatted date + rotating chevron.
 * Used by EventFormSheet's date pickers. */
export function DateRow({ label, value, locale, expanded, onToggle }: DateRowProps) {
  const formatted = formatDateShort(value, locale);
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="flex w-full items-center justify-between px-4 py-3 text-left"
    >
      <span className="text-sm text-brand-gray700">{label}</span>
      <span
        className={
          'flex items-center gap-2 text-base font-medium ' +
          (expanded ? 'text-brand-pink300' : 'text-brand-gray900')
        }
      >
        <span>{formatted}</span>
        <ChevronDownIcon
          className={'h-2 w-3 transition-transform ' + (expanded ? 'rotate-180' : '')}
        />
      </span>
    </button>
  );
}
