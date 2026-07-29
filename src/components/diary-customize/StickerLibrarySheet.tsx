'use client';
import { useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import type { DiarySticker } from '@/types';

interface StickerLibrarySheetProps {
  stickers: DiarySticker[];
  urls: Record<string, string>;
  onPickFile: (file: File) => void;
  onPickSticker?: (sticker: DiarySticker) => void;
}

export function StickerLibrarySheet({
  stickers,
  urls,
  onPickFile,
  onPickSticker,
}: StickerLibrarySheetProps) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onPickFile(file);
    e.target.value = '';
    setMenuOpen(false);
  }

  return (
    <section
      className="mt-4 flex flex-col rounded-t-3xl bg-brand-white pt-3 shadow-[0_-8px_32px_0_rgba(0,0,0,0.08)]"
      style={{ maxHeight: '50vh' }}
    >
      <div
        aria-hidden
        className="mx-auto mb-2 h-1 w-10 rounded-full bg-brand-gray400"
      />
      <div className="flex items-center justify-between px-6 pb-3">
        <span aria-hidden className="w-6" />
        <h2 className="text-base font-semibold text-brand-gray900">
          {t.report.diary.customize.stickerLibrary}
        </h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t.report.diary.customize.addSticker}
            aria-expanded={menuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gray400/40 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path
                d="M7 1.5v11M1.5 7h11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {menuOpen ? (
            <>
              <button
                type="button"
                aria-label={t.report.diary.customize.back}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-30 cursor-default"
              />
              <div className="absolute right-0 top-10 z-40 flex w-48 flex-col overflow-hidden rounded-2xl bg-brand-gray900 text-sm text-brand-white shadow-lg">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 text-left focus-visible:outline-none focus-visible:bg-brand-gray800"
                >
                  <AlbumIcon />
                  <span>{t.report.diary.customize.chooseAlbum}</span>
                </button>
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-2 px-4 py-3 text-left opacity-60"
                >
                  <CameraIcon />
                  <span>{t.report.diary.customize.takePhoto}</span>
                  <span className="ml-auto text-xs text-brand-gray400">
                    {t.report.diary.customize.cameraComingSoon}
                  </span>
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {stickers.length === 0 ? null : (
          <div className="grid grid-cols-3 gap-4">
            {stickers.map((s) => {
              const url = urls[s.id];
              if (!url) return null;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onPickSticker?.(s)}
                  disabled={!onPickSticker}
                  className="relative overflow-hidden rounded-lg bg-brand-gray200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 disabled:cursor-default"
                  style={{ aspectRatio: s.ratio === '1:1' ? '1 / 1' : '4 / 3' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </section>
  );
}

function AlbumIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
      <rect
        x="2.5"
        y="4.5"
        width="13"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3 12l3-3 3 3 2-2 4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
      <path
        d="M2.5 6a2 2 0 012-2h2l1-1.5h3l1 1.5h2a2 2 0 012 2v6a2 2 0 01-2 2h-9a2 2 0 01-2-2V6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
