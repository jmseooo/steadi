"use client";

import { useEffect, useState, type ReactNode } from "react";

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 810;

type Viewport = { scale: number; width: number };

// 1440×810 프레임이 화면 안에 통째로 들어오도록 축척을 맞춘다.
// - 본문: 가로 가운데, 프레임 바닥을 화면 바닥에 붙여 휠이 Figma처럼 반원만 보이게
// - GNB: 화면 상단 전체 폭 / 사이드 내비: 화면 왼쪽 세로 가운데
export default function Stage({
  header,
  side,
  children,
}: {
  header: ReactNode;
  side: ReactNode;
  children: ReactNode;
}) {
  const [viewport, setViewport] = useState<Viewport | null>(null);

  useEffect(() => {
    const update = () => {
      const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
      setViewport({ scale, width: window.innerWidth / scale });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scale = viewport?.scale ?? 1;

  return (
    <main className={`relative h-dvh overflow-hidden ${viewport ? "" : "invisible"}`}>
      <div
        className="absolute bottom-0 left-1/2 origin-bottom overflow-hidden"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `translateX(-50%) scale(${scale})`,
        }}
      >
        {children}
      </div>

      <div
        className="absolute top-1/2 left-0 origin-left"
        style={{ transform: `translateY(-50%) scale(${scale})` }}
      >
        {side}
      </div>

      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: viewport?.width ?? DESIGN_WIDTH, transform: `scale(${scale})` }}
      >
        {header}
      </div>
    </main>
  );
}
