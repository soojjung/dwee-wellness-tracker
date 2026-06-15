'use client';
import { useRef } from 'react';
import { useT } from '@/i18n/useT';
import type { SupportedImageMediaType } from '@/types';
import { supportedMediaType } from '@/lib/image/fileToBase64';

interface PhotoPickerProps {
  remaining: number | null;
  onPicked: (input: { file: File; mediaType: SupportedImageMediaType }) => void;
  onInvalidFormat: () => void;
}

export function PhotoPicker({ remaining, onPicked, onInvalidFormat }: PhotoPickerProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const mediaType = supportedMediaType(file);
    if (!mediaType) {
      onInvalidFormat();
      return;
    }
    onPicked({ file, mediaType });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-2xl bg-brand-pink200 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-pink800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
      >
        {t.magazine.diagnose.picker.selectButton}
      </button>
      <p className="text-xs text-brand-gray600">{t.magazine.diagnose.picker.formatHint}</p>

      {remaining !== null ? (
        <p className="text-xs text-brand-gray600">
          {t.magazine.diagnose.picker.remainingPrefix}
          <strong className="font-semibold text-brand-gray900">{remaining}</strong>
          {t.magazine.diagnose.picker.remainingSuffix}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
