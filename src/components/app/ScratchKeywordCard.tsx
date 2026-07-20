'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import type { CyclePhase } from '@/domain/cycle/types';

interface ScratchKeywordCardProps {
  phase: CyclePhase;
  today: string;
}

const SCRATCH_RADIUS = 28;
const REVEAL_THRESHOLD = 0.42;
const STORAGE_PREFIX = 'dwee:ui:home_scratch:';

export function ScratchKeywordCard({ phase, today }: ScratchKeywordCardProps) {
  const t = useT();
  const items = t.home.keywords[phase];
  const keyword = useMemo(() => {
    if (items.length === 0) return null;
    const index = hashDate(today) % items.length;
    return items[index] ?? items[0] ?? null;
  }, [items, today]);

  const storageKey = `${STORAGE_PREFIX}${today}:${phase}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const preparedRef = useRef(false);

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage.getItem(storageKey) === '1') {
        setRevealed(true);
      } else {
        setRevealed(false);
        preparedRef.current = false;
      }
    } catch {
      setRevealed(false);
    }
  }, [storageKey]);

  const prepareCanvas = useCallback(() => {
    if (preparedRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#FBB7D8');
    gradient.addColorStop(1, '#FDE2EF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = 'rgba(255,253,254,0.55)';
    ctx.font = '600 15px Pretendard, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.home.scratchHint, rect.width / 2, rect.height / 2);
    ctx.globalCompositeOperation = 'destination-out';
    preparedRef.current = true;
  }, [t.home.scratchHint]);

  useEffect(() => {
    if (revealed) return;
    prepareCanvas();
    const handle = () => {
      preparedRef.current = false;
      prepareCanvas();
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [revealed, prepareCanvas]);

  const revealNow = useCallback(() => {
    setRevealed(true);
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, '1');
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const scratchAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.beginPath();
    ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const checkRevealThreshold = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = image.data;
      const step = 40; // every 10th pixel
      let cleared = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += step) {
        total += 1;
        if (data[i] === 0) cleared += 1;
      }
      if (total > 0 && cleared / total >= REVEAL_THRESHOLD) {
        revealNow();
      }
    } catch {
      /* getImageData can throw on tainted canvas — safe to skip */
    }
  }, [revealNow]);

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed) return;
    prepareCanvas();
    drawingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed || !drawingRef.current) return;
    scratchAt(e.clientX, e.clientY);
  }

  function onPointerEnd(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed) return;
    drawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    checkRevealThreshold();
  }

  if (!keyword) return null;

  return (
    <div
      ref={containerRef}
      className="relative h-[178px] w-full overflow-hidden rounded-2xl bg-brand-pink50 shadow-[inset_0_0_30px_0_rgba(255,255,255,0.7)]"
    >
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-6 text-center">
        <span className="text-base font-medium text-brand-gray900">{keyword.subtitle}</span>
        <span className="flex items-center gap-1 text-2xl font-semibold text-brand-gray900">
          <span>{keyword.main}</span>
          <span aria-hidden>{keyword.emoji}</span>
        </span>
      </div>

      {!revealed ? (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t.home.scratchCanvasAria}
          className="absolute inset-0 h-full w-full touch-none cursor-pointer"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onPointerLeave={onPointerEnd}
        />
      ) : null}
    </div>
  );
}

function hashDate(iso: string): number {
  let hash = 5381;
  for (let i = 0; i < iso.length; i += 1) {
    hash = ((hash << 5) + hash + iso.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
