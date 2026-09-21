'use client';
import { useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { pickNativePhotos } from '@/lib/image/pickNativePhotos';

interface Options {
  onPicked: (file: File) => void;
}

/**
 * 앨범에서 사진 한 장 고르기.
 *
 * 네이티브(Capacitor)에서는 OS 앨범 피커를 바로 연다 — 카메라/파일 선택이 섞인
 * 액션 시트를 거치지 않는다. 웹에는 그런 API 가 없어 file input 으로 떨어지고,
 * 그때 뜨는 다이얼로그(iOS Safari 는 사진 보관함·사진 찍기·파일 선택 3단)는
 * 브라우저가 정한다.
 */
export function usePhotoLibraryPicker({ onPicked }: Options) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function open() {
    if (!Capacitor.isNativePlatform()) {
      inputRef.current?.click();
      return;
    }
    try {
      const [file] = await pickNativePhotos(1);
      if (!file) return;
      // Renamed to this screen's own convention — the shared primitive names
      // by index ('photo-0.jpg'), this call site always wants 'photo.jpg'.
      onPicked(new File([file], 'photo.jpg', { type: file.type }));
    } catch {
      // 사용자가 취소했거나 피커를 열 수 없는 경우 — 아무것도 하지 않는다.
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onPicked(file);
  }

  /** 웹 폴백용 숨은 input. 훅을 쓰는 화면이 반드시 렌더해야 한다. */
  const input = (
    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
  );

  return { open, input };
}
