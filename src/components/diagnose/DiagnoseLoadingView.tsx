'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';

export function LoadingView({ blurUrl }: { blurUrl: string }) {
  const t = useT();
  const l = t.magazine.diagnose.loading;
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const target = 12_000;
    const tick = () => {
      const elapsed = performance.now() - start;
      const easedTarget = Math.min(0.95, elapsed / target);
      setPercent((prev) => {
        const jitter = 0.005 + Math.random() * 0.01;
        const next = Math.min(easedTarget, prev + jitter);
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const percentInt = Math.round(percent * 100);

  return (
    <div className="fixed inset-0 z-40 flex h-dvh w-full items-center justify-center overflow-hidden">
      <img
        src={blurUrl}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-[15px]"
      />
      {/* 배경이 밝은 사진이면 흰 글씨가 묻힌다. 모달 규칙의 기본 딤과 같은 값. */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative flex flex-col items-center gap-8 px-6">
        <CircularProgress percent={percent} label={`${percentInt}%`} />
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-2xl font-semibold leading-normal text-brand-gray50">{l.title}</p>
          <p className="text-base leading-normal text-brand-gray200">{l.body}</p>
        </div>
      </div>
      <p className="absolute inset-x-0 bottom-16 whitespace-pre-line px-6 text-center text-sm leading-[1.5] text-brand-gray200">
        {l.resultLocation}
      </p>
    </div>
  );
}

function CircularProgress({ percent, label }: { percent: number; label: string }) {
  const size = 180;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * percent;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,253,254,0.2)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#FFFDFE"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <p className="absolute inset-0 flex items-center justify-center text-2xl font-bold leading-normal text-brand-gray50">
        {label}
      </p>
    </div>
  );
}
