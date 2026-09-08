export interface BodyBullet {
  readonly label: string;
  readonly text: string;
}

export interface SplitBody {
  /** 불릿 앞에 오는 도입 문장. 없을 수도 있다. */
  readonly lead: string;
  readonly bullets: readonly BodyBullet[];
}

// 불릿은 `라벨: 설명` 꼴로 시작하고, 라벨엔 문장부호가 없다. 앞 문장이 끝난
// 자리(`. ` 뒤)에서만 잘라야 본문 중간의 콜론에 걸리지 않는다.
const BULLET_START = /(?:^|(?<=\. ))([^.:!?]{2,24}): /g;

/**
 * 시안의 본문은 한 덩어리 텍스트지만 화면에는 도입 문장 + 불릿 목록으로 보인다.
 * Figma 의 리스트 서식은 메타데이터로 나오지 않아, `라벨: ` 패턴으로 나눈다.
 *
 * 패턴이 안 잡히면 통째로 도입 문장이 된다 — 불릿이 없는 문단도 있기 때문이다.
 */
export function splitBody(body: string): SplitBody {
  const starts: Array<{ index: number; label: string; from: number }> = [];
  BULLET_START.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = BULLET_START.exec(body)) !== null) {
    const label = m[1];
    if (!label) continue;
    starts.push({ index: m.index, label: label.trim(), from: m.index + m[0].length });
  }

  if (starts.length === 0) return { lead: body.trim(), bullets: [] };

  const first = starts[0]!;
  const lead = body.slice(0, first.index).trim();
  const bullets = starts.map((s, i) => {
    const end = i + 1 < starts.length ? starts[i + 1]!.index : body.length;
    return { label: s.label, text: body.slice(s.from, end).trim() };
  });
  return { lead, bullets };
}
