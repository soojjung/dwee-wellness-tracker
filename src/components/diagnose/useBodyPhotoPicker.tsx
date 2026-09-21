'use client';
import { useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { supportedMediaType } from '@/lib/image/fileToBase64';
import { pickNativePhotos } from '@/lib/image/pickNativePhotos';
import type { SupportedImageMediaType } from '@/types';

export interface PickedPhoto {
  file: File;
  previewUrl: string;
  mediaType: SupportedImageMediaType;
}

interface Options {
  /** 한 번에 고를 수 있는 최대 장수. */
  limit: number;
  onPicked: (picked: readonly PickedPhoto[]) => void;
}

/**
 * 체형 사진 선택. 사진을 고르는 화면이 둘(안내 화면, 미리보기 화면)이라 훅으로 뺐다.
 *
 * 네이티브(Capacitor)에서는 OS 앨범 피커를 바로 연다 — 카메라/파일 선택이 섞인
 * 액션 시트를 거치지 않는다. 웹에는 그런 API 가 없어 file input 으로 떨어지고,
 * 그때 뜨는 다이얼로그는 브라우저가 정한다.
 */
export function useBodyPhotoPicker({ limit, onPicked }: Options) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function open() {
    if (!Capacitor.isNativePlatform()) {
      inputRef.current?.click();
      return;
    }
    try {
      const files = await pickNativePhotos(limit);
      const picked: PickedPhoto[] = [];
      for (const raw of files) {
        // Renamed to this screen's own convention ('body-N.jpg') — the shared
        // primitive names by its own index ('photo-N.jpg').
        const file = new File([raw], `body-${picked.length}.jpg`, { type: raw.type });
        const mediaType = supportedMediaType(file);
        if (!mediaType) continue;
        picked.push({ file, previewUrl: URL.createObjectURL(file), mediaType });
      }
      if (picked.length > 0) onPicked(picked);
    } catch {
      // 사용자가 취소했거나 피커를 열 수 없는 경우 — 아무것도 하지 않는다.
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, limit);
    event.target.value = '';
    const picked = files.flatMap((file) => {
      const mediaType = supportedMediaType(file);
      return mediaType ? [{ file, previewUrl: URL.createObjectURL(file), mediaType }] : [];
    });
    if (picked.length === 0) return;
    onPicked(picked);
  }

  /** 웹 폴백용 숨은 input. 훅을 쓰는 화면이 반드시 렌더해야 한다. */
  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      className="hidden"
      onChange={handleChange}
    />
  );

  return { open, input };
}
