"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

// 원형 휠은 Figma 1440×810 프레임 좌표로 그려져 있다. 컨트롤 아래(프레임 y 240~810)만 잘라
// 남은 화면에 맞춰 축척하고, 휠 중심(x 755)을 본문 가운데에 맞춰 바닥에 붙인다.
const FRAME_WIDTH = 1440;
const CROP_TOP = 240;
const CROP_HEIGHT = 810 - CROP_TOP;
const CENTER_X = 755;
// 화살표·가운데 카드·문구가 다 보이는 최소 폭. 휠은 이 폭이 화면에 들어오는 한도 안에서 높이에 맞춘다.
const ESSENTIAL_WIDTH = 560;
const DESKTOP = 1024;

// 데스크톱: 1440까진 1배(양옆 카드만 잘림), 그 이상은 폭에 맞춰 키움 → 1440×810에서 Figma와 동일
// 1024 미만: 남은 높이를 채우도록 키우거나 줄임 (세로로 긴 태블릿·모바일)
function fitScale(width: number, height: number) {
  const byHeight = height / CROP_HEIGHT;
  const maxByWidth = width / ESSENTIAL_WIDTH;
  if (width < DESKTOP) return Math.min(byHeight, maxByWidth);
  return Math.min(byHeight, Math.max(1, width / FRAME_WIDTH));
}

export default function WheelStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(fitScale(entry.contentRect.width, entry.contentRect.height));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative min-h-[320px] flex-1 overflow-hidden">
      <div className="absolute bottom-0 left-[calc(var(--pad-l)+(100%-var(--pad-l)-var(--pad-r))/2)]">
        <div
          className={`absolute bottom-0 ${scale === null ? "invisible" : ""}`}
          style={{
            width: FRAME_WIDTH,
            height: CROP_HEIGHT,
            left: -CENTER_X,
            transformOrigin: `${CENTER_X}px 100%`,
            transform: `scale(${scale ?? 1})`,
          }}
        >
          <div className="absolute inset-x-0" style={{ top: -CROP_TOP, height: 810 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
