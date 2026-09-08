import type { BodyTypeReport } from '@/types';
import { DEPRECATED_KEYS } from './adapters/indexeddb/keys';

// 저장소를 Repository(IndexedDB / Supabase) 로 옮기기 전에 쓰던 브라우저 키.
// 이미 진단해 둔 사용자의 결과를 한 번 끌어올리는 용도로만 남겨 둔다.
const LEGACY_KEY = DEPRECATED_KEYS.bodyTypeReportBrowser;

interface LegacyStored {
  report: BodyTypeReport;
  savedAt: string;
}

/** local → session 순으로 옛 저장 위치를 훑는다. 없으면 null. */
export function readLegacyLocalReport(): BodyTypeReport | null {
  if (typeof window === 'undefined') return null;
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = store.getItem(LEGACY_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as LegacyStored;
      if (parsed.report) return parsed.report;
    } catch {
      // 접근 불가하거나 깨진 값 — 다음 저장소로 넘어간다.
    }
  }
  return null;
}

export function clearLegacyLocalReport(): void {
  if (typeof window === 'undefined') return;
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      store.removeItem(LEGACY_KEY);
    } catch {
      /* ignore */
    }
  }
}
