'use client';
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';

interface StickerAddMenuProps {
  /** Only rendered in browse mode — an empty 40px spacer otherwise, so the
   * header's centered title stays centered either way. */
  visible: boolean;
  ariaLabel: string;
  backAriaLabel: string;
  chooseAlbumLabel: string;
  takePhotoLabel: string;
  cancelLabel: string;
  onPickAlbum: () => void;
  onOpenCamera: () => void;
}

/** Sticker library header's "+" menu (spec 3 — hidden in edit mode):
 * choose from album or open the camera. In the app it is the iOS system
 * action sheet, like every other photo prompt; the dropdown below is the web
 * fallback. "Take photo" still opens the in-app camera for the cutout mode. */
export function StickerAddMenu({
  visible,
  ariaLabel,
  backAriaLabel,
  chooseAlbumLabel,
  takePhotoLabel,
  cancelLabel,
  onPickAlbum,
  onOpenCamera,
}: StickerAddMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Edit mode used to unmount this menu, which also dropped its open state.
  useEffect(() => {
    if (!visible) setMenuOpen(false);
  }, [visible]);

  if (!visible) return <span aria-hidden className="size-10 justify-self-end" />;

  async function handleAddClick() {
    if (!Capacitor.isNativePlatform()) {
      setMenuOpen((v) => !v);
      return;
    }
    const { index } = await ActionSheet.showActions({
      options: [
        { title: chooseAlbumLabel },
        { title: takePhotoLabel },
        { title: cancelLabel, style: ActionSheetButtonStyle.Cancel },
      ],
    });
    if (index === 0) onPickAlbum();
    else if (index === 1) onOpenCamera();
  }

  return (
    <div className="relative justify-self-end">
      <button
        type="button"
        onClick={() => void handleAddClick()}
        aria-label={ariaLabel}
        aria-expanded={menuOpen}
        className="flex size-10 items-center justify-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
      >
        {/* Path copied from the exported Figma icon (256:20932). */}
        <svg viewBox="0 0 40 40" className="size-full" fill="none" aria-hidden>
          <path
            d="M20 11.5147L20 28.4853M28.4853 20L11.5147 20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label={backAriaLabel}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute right-0 top-12 z-40 flex w-48 flex-col overflow-hidden rounded-2xl bg-brand-gray900 text-sm text-brand-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                // Close our menu first so it never sits under the OS
                // picker (web fallback) — the two stacked was the bug.
                setMenuOpen(false);
                onPickAlbum();
              }}
              className="flex items-center gap-2 px-4 py-3 text-left focus-visible:bg-brand-gray800 focus-visible:outline-none"
            >
              <AlbumIcon />
              <span>{chooseAlbumLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenCamera();
              }}
              className="flex items-center gap-2 px-4 py-3 text-left focus-visible:bg-brand-gray800 focus-visible:outline-none"
            >
              <CameraIcon />
              <span>{takePhotoLabel}</span>
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function AlbumIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
      <rect x="2.5" y="4.5" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
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
