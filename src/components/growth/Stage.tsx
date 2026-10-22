"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";

// 1440×810 Figma 프레임을 창에 맞춰 축소(확대 안 함)해 가운데. 바깥은 같은 배경색
// bleed: 프레임 밖으로 나간 요소(양옆 카드 등)를 자르지 않고 창 끝까지 보여 준다
export default function Stage({ children, bleed = false }: { children: ReactNode; bleed?: boolean }) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(1, window.innerWidth / 1440, window.innerHeight / 810));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <main className="fixed inset-0 overflow-hidden bg-canvas">
      <div
        className={`absolute top-1/2 left-1/2 h-[810px] w-[1440px] ${bleed ? "" : "overflow-hidden"}`}
        style={{ translate: "-50% -50%", scale: String(scale) }}
      >
        {children}
      </div>
    </main>
  );
}
