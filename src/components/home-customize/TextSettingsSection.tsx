'use client';
import { useRef } from 'react';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useKeyboardEnsureVisible } from '@/lib/useKeyboardEnsureVisible';
import {
  MAIN_TEXT_MAX,
  SUB_TEXT_MAX,
  type TextOrder,
  type TextPosition,
} from '@/domain/home/decor';

const MAIN_KEYBOARD_MARGIN_PX = 56;
const SUB_KEYBOARD_MARGIN_PX = 40;

const POSITION_ORDER: readonly TextPosition[] = [
  'bottomLeft',
  'topLeft',
  'bottomRight',
  'topRight',
];

interface TextSettingsSectionProps {
  position: TextPosition | null;
  mainText: string;
  subText: string;
  textOrder: TextOrder;
  mainPlaceholder: string;
  subPlaceholder: string;
  onPositionChange: (position: TextPosition) => void;
  onMainChange: (text: string) => void;
  onSubChange: (text: string) => void;
  onSwap: () => void;
}

export function TextSettingsSection({
  position,
  mainText,
  subText,
  textOrder,
  mainPlaceholder,
  subPlaceholder,
  onPositionChange,
  onMainChange,
  onSubChange,
  onSwap,
}: TextSettingsSectionProps) {
  const t = useT();
  const swapEnabled = mainText.length > 0 && subText.length > 0;
  const mainField = (
    <TextField
      value={mainText}
      onChange={onMainChange}
      placeholder={mainPlaceholder}
      max={MAIN_TEXT_MAX}
      swapEnabled={swapEnabled}
      onSwap={onSwap}
      bottomMarginPx={MAIN_KEYBOARD_MARGIN_PX}
    />
  );
  const subField = (
    <TextField
      value={subText}
      onChange={onSubChange}
      placeholder={subPlaceholder}
      max={SUB_TEXT_MAX}
      swapEnabled={swapEnabled}
      onSwap={onSwap}
      bottomMarginPx={SUB_KEYBOARD_MARGIN_PX}
    />
  );

  return (
    <section className="px-4 py-10">
      <h2 className="text-lg font-semibold text-brand-gray900">{t.home.customize.text.title}</h2>
      <p className="mt-1 text-xs leading-[1.5] text-brand-gray800">{t.home.customize.text.hint}</p>

      <ul className="mt-4 grid grid-cols-2 gap-2">
        {POSITION_ORDER.map((p) => {
          const isSelected = position === p;
          return (
            <li key={p}>
              <button
                type="button"
                onClick={() => onPositionChange(p)}
                aria-pressed={isSelected}
                aria-label={t.home.customize.text.position[p]}
                className={cn(
                  'flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl py-4 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-[0.75px] border-brand-pink200 bg-brand-pink50'
                    : 'border-[0.75px] border-brand-gray400 bg-transparent hover:bg-brand-gray200',
                )}
              >
                <PositionIcon position={p} />
                <span className="text-xs font-semibold text-brand-gray900">
                  {t.home.customize.text.position[p]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 space-y-4">
        {textOrder === 'mainFirst' ? mainField : subField}
        {textOrder === 'mainFirst' ? subField : mainField}
      </div>
    </section>
  );
}

interface TextFieldProps {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  max: number;
  swapEnabled: boolean;
  onSwap: () => void;
  bottomMarginPx: number;
}

function TextField({
  value,
  onChange,
  placeholder,
  max,
  swapEnabled,
  onSwap,
  bottomMarginPx,
}: TextFieldProps) {
  const t = useT();
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useKeyboardEnsureVisible(ref, bottomMarginPx);
  return (
    <div className="relative rounded-lg bg-brand-gray200 px-5 py-3">
      <button
        type="button"
        onClick={onSwap}
        disabled={!swapEnabled}
        aria-label={t.home.customize.text.swapAriaLabel}
        className={cn(
          'absolute -top-2 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2',
          swapEnabled
            ? 'bg-brand-gray900 text-brand-white hover:bg-brand-gray800'
            : 'cursor-default bg-brand-gray400 text-brand-gray900',
        )}
      >
        <SwapIcon />
      </button>
      <textarea
        ref={ref}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        placeholder={placeholder}
        maxLength={max}
        className="block w-full resize-none bg-transparent pr-6 text-base text-brand-gray900 placeholder:text-brand-gray600 focus:outline-none"
      />
      <span className="block text-right text-xs font-medium text-brand-gray600">
        {value.length}/{max}
      </span>
    </div>
  );
}

function PositionIcon({ position }: { position: TextPosition }) {
  const isTop = position === 'topLeft' || position === 'topRight';
  const isLeft = position === 'topLeft' || position === 'bottomLeft';
  const markX = isLeft ? 4 : 11;
  const markY = isTop ? 4 : 13;
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="#353434"
      strokeWidth="1.6"
      className="h-5 w-5"
      aria-hidden
    >
      <rect x="1" y="1" width="18" height="18" rx="3" />
      <rect x={markX} y={markY} width="5" height="3" rx="0.5" fill="#353434" stroke="none" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-3 w-3"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v9m0 0l-2-2m2 2l2-2M11 13V4m0 0l-2 2m2-2l2 2"
      />
    </svg>
  );
}
