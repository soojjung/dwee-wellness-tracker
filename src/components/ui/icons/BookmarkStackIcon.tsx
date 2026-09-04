interface BookmarkStackIconProps {
  filled: boolean;
  className?: string;
}

// 앞장 리본. filled 는 Figma 도형 그대로, 아웃라인은 같은 실루엣을 stroke 로 그린다.
const FRONT_PATH =
  'M4.23529 6.54504C4.23529 5.2694 5.26241 4.23529 6.52941 4.23529H15.7059C16.9729 4.23529 18 5.2694 18 6.54504V19.6336C18 20.994 16.376 21.6861 15.4059 20.739L11.65 17.2836C11.3534 16.994 10.8819 16.994 10.5853 17.2836L6.8294 20.739C5.85934 21.6861 4.23529 20.994 4.23529 19.6336V6.54504Z';

// filled: 뒷장에서 앞장(+1.5px 여백)을 뺀 조각. 채웠을 때 두 장 사이 간격이 생긴다.
const BACK_SUBTRACT_PATH =
  'M11.4707 0C12.7376 6.23944e-05 13.7646 1.03405 13.7646 2.30957V2.73535H6.5293C4.42442 2.73545 2.73544 4.45061 2.73535 6.54492V16.373L2.59375 16.5039C1.6237 17.4505 0.000129796 16.7586 0 15.3984V2.30957C9.18164e-05 1.03407 1.02708 9.37844e-05 2.29395 0H11.4707Z';

// outline: 위 조각 중 앞장에 가려지는 안쪽 선을 뺀 열린 경로.
const BACK_OUTLINE_PATH =
  'M13.7646 2.73535V2.30957C13.7646 1.03405 12.7376 0 11.4707 0H2.29395C1.02708 9.37844e-05 9.18164e-05 1.03407 0 2.30957V15.3984C0.000129796 16.7586 1.6237 17.4505 2.59375 16.5039L2.73535 16.373';

/** 저장한 글 모음(복수)을 뜻하는 겹친 두 장 리본. 한 건의 저장 토글은 BookmarkIcon. */
export function BookmarkStackIcon({ filled, className }: BookmarkStackIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <g transform="translate(3 1.41176)">
        <path d={FRONT_PATH} />
        <path d={filled ? BACK_SUBTRACT_PATH : BACK_OUTLINE_PATH} />
      </g>
    </svg>
  );
}
