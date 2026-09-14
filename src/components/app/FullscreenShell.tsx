'use client';
import type { ReactNode } from 'react';
import { useCoreStoresHydration } from '@/hooks/useCoreStoresHydration';

/** 풀스크린 라우트용 껍데기 — 하단 탭 없이 공통 스토어 hydrate 만 맡는다. */
export function FullscreenShell({ children }: { children: ReactNode }) {
  useCoreStoresHydration();
  return <div className="mx-auto min-h-dvh w-full max-w-md">{children}</div>;
}
