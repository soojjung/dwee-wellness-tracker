'use client';
import { useState } from 'react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { cropToRatio } from '@/lib/image/stickerCrop';
import type { StickerRatio } from '@/types';
import { PhotoRatioScreen } from './PhotoRatioScreen';

interface CapturedPhotoRatioStepProps {
  /** 카메라가 뷰파인더 그대로 담아 온 원본. */
  blob: Blob;
  /** 되돌리기(↺) — 다시 찍으러 카메라로. */
  onRetake: () => void;
  onClose: () => void;
  onSaved: (cropped: Blob, ratio: StickerRatio) => Promise<void> | void;
}

/**
 * 013_5/6 — 사진을 "그대로" 쓸 때만 거치는 비율 선택. 촬영 전에 고르게 하던 것을
 * 촬영 뒤로 옮긴 자리다. 화면 자체는 앨범 불러오기와 같은 `PhotoRatioScreen` 을 쓴다.
 */
export function CapturedPhotoRatioStep({
  blob,
  onRetake,
  onClose,
  onSaved,
}: CapturedPhotoRatioStepProps) {
  const [ratio, setRatio] = useState<StickerRatio>('1:1');
  const [submitting, setSubmitting] = useState(false);
  const previewUrl = useObjectUrl(blob);

  useBodyScrollLock();

  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const cropped = await cropToRatio(blob, ratio);
      if (!cropped) return;
      await onSaved(cropped, ratio);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PhotoRatioScreen
      previewUrl={previewUrl}
      value={ratio}
      onChange={setRatio}
      onBack={onRetake}
      onClose={onClose}
      onConfirm={handleConfirm}
      submitting={submitting}
    />
  );
}
