'use client';
import { useEffect, useLayoutEffect, useState, type CSSProperties } from 'react';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { FitStage } from '@/components/ui/FitStage';
import { consumeLoginEntrance } from '@/lib/loginEntrance';

// Figma 256:16007 (001_4 로그인) — 화면 맨 위(y=0)부터 Apple 버튼 위(y=581)까지.
// 스티커가 좌우로 살짝 잘려 나가는 배치라, 이 좌표계를 통째로 맞춰 넣는다.
const STAGE_WIDTH = 390;
const STAGE_HEIGHT = 581;

interface StickerSpec {
  src: string;
  /** 시안 좌표계에서의 자리와 크기. */
  box: string;
  image?: string;
  /** 날아 들어오기 전 위치 — 제자리 기준 offset(px). 각자 가까운 화면 가장자리 밖에서 출발한다. */
  flyFrom: [x: number, y: number];
}

// 헤드폰은 로고 왼쪽 끝과 겹치고, 시안에서 로고보다 아래 레이어라 따로 먼저 그린다.
const HEADPHONES: StickerSpec = {
  src: '/login/sticker-headphones.webp',
  box: 'left-[-11px] top-[128px] h-[150px] w-[143px]',
  flyFrom: [-220, -60],
};
const STICKERS: StickerSpec[] = [
  {
    src: '/login/sticker-matcha.webp',
    box: 'left-[297px] top-[80px] h-[130px] w-[111px]',
    flyFrom: [200, -120],
  },
  {
    src: '/stickers/default/workout.png',
    box: 'left-[-2px] top-[401px] h-[148px] w-[112px]',
    image: 'rotate-[15deg] rounded-lg object-cover',
    flyFrom: [-240, 80],
  },
  {
    src: '/login/sticker-toast.webp',
    box: 'left-[225px] top-[338px] h-[132px] w-[135px]',
    flyFrom: [260, 40],
  },
  {
    src: '/login/sticker-lemon-water.webp',
    box: 'left-[329px] top-[397px] h-[109px] w-[79px]',
    flyFrom: [200, 120],
  },
];

export function LoginHero() {
  const t = useT();
  const decoded = useImagesDecoded([HEADPHONES, ...STICKERS].map((s) => s.src));
  // 날아 들어오는 연출은 온보딩을 막 끝내고 온 첫 진입에만 쓴다. 로그아웃 직후나
  // 마이페이지에서 들어올 때마다 반복되면 거슬린다. 첫 페인트 전에 정해야 스티커가
  // 제자리에 한 번 보였다가 튀어 나가지 않는다.
  const [entrance, setEntrance] = useState(false);
  useLayoutEffect(() => {
    if (consumeLoginEntrance()) setEntrance(true);
  }, []);
  const motion: StickerMotion = !entrance ? 'rest' : decoded ? 'fly' : 'wait';

  return (
    <FitStage width={STAGE_WIDTH} height={STAGE_HEIGHT} align="center">
      <Sticker spec={HEADPHONES} motion={motion} />
      <img
        src="/brand/wordmark-dwee.svg"
        alt={t.app.name}
        width={161}
        height={46}
        draggable={false}
        className="absolute left-1/2 top-[263px] -translate-x-1/2 select-none"
      />
      {STICKERS.map((spec) => (
        <Sticker key={spec.src} spec={spec} motion={motion} />
      ))}
    </FitStage>
  );
}

/**
 * 스티커가 "한 번에" 들어오려면 출발 시점이 같아야 한다. 이미지마다 로딩이 끝나는 대로
 * 움직이면 제각각 튀어나오므로, 전부 디코드된 뒤에 함께 출발시킨다.
 */
function useImagesDecoded(sources: string[]): boolean {
  const [ready, setReady] = useState(false);
  const key = sources.join('|');

  useEffect(() => {
    let alive = true;
    const decodes = key.split('|').map((src) => {
      const img = new Image();
      img.src = src;
      // 한 장이 실패해도 나머지는 들어와야 한다.
      return img.decode().catch(() => undefined);
    });
    void Promise.all(decodes).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [key]);

  return ready;
}

/** rest: 제자리에 그냥 보임 · wait: 출발 전이라 숨김 · fly: 날아 들어오는 중. */
type StickerMotion = 'rest' | 'wait' | 'fly';

function Sticker({ spec, motion }: { spec: StickerSpec; motion: StickerMotion }) {
  const flyVars = {
    '--fly-x': `${spec.flyFrom[0]}px`,
    '--fly-y': `${spec.flyFrom[1]}px`,
  } as CSSProperties;

  return (
    <div
      style={flyVars}
      className={cn(
        'absolute',
        spec.box,
        motion === 'wait' && 'opacity-0',
        motion === 'fly' && 'animate-stickerFlyIn motion-reduce:animate-none',
      )}
    >
      <img
        src={spec.src}
        alt=""
        draggable={false}
        className={cn('h-full w-full select-none object-contain', spec.image)}
      />
    </div>
  );
}
