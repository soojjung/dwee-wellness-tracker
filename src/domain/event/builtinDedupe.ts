import type { EventCategory } from '@/types';

/**
 * 기본 일정 유형(가족·친구·회사·모임)이 두 벌 이상 저장된 계정을 정리하기 위한 계획.
 *
 * 시드가 동시에 두 번 돌아 같은 기본 유형이 중복 저장된 계정이 있다. 같은 자리(`order`)의
 * 기본 유형 중 **이름과 색까지 같은 것만** 중복으로 본다 — 사용자가 이름이나 색을 바꾼
 * 쪽은 의도가 담긴 데이터라 건드리지 않는다.
 *
 * 남기는 쪽은 가장 먼저 만들어진 것(`createdAt`, 같으면 `id` 순)이다. 기준이 결정적이어야
 * 두 기기가 동시에 정리해도 같은 것을 남긴다.
 *
 * @returns 지울 유형 id → 그 유형을 쓰던 일정이 옮겨 갈(남길) 유형 id
 */
export function planBuiltinDedupe(categories: readonly EventCategory[]): Map<string, string> {
  const keeperByKey = new Map<string, EventCategory>();
  const replacements = new Map<string, string>();

  const oldestFirst = [...categories]
    .filter((c) => c.isBuiltIn)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));

  for (const category of oldestFirst) {
    const key = `${category.order}|${category.colorId}|${category.name}`;
    const keeper = keeperByKey.get(key);
    if (keeper) replacements.set(category.id, keeper.id);
    else keeperByKey.set(key, category);
  }
  return replacements;
}
