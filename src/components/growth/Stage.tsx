"use client";

import { useLayoutEffect, useState, type ComponentProps, type ReactNode } from "react";
import Gnb from "../Gnb";

const GNB_H = 60; // Figma 프레임에서 GNB가 차지하는 높이

// 1440×810 Figma 프레임을 창에 맞춰 축소(확대 안 함)해 가운데. 바깥은 같은 배경색
// bleed: 프레임 밖으로 나간 요소(양옆 카드 등)를 자르지 않고 창 끝까지 보여 준다
// gnb: GNB는 무대 밖에서 홈과 똑같이 화면 맨 위·원래 크기로 그리고,
//      무대는 프레임의 GNB 아랫부분(y 60)이 GNB 바로 아래에 오도록 위에 붙인다
export default function Stage({
  children,
  bleed = false,
  gnb,
}: {
  children: ReactNode;
  bleed?: boolean;
  gnb?: ComponentProps<typeof Gnb>["active"];
}) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(1, window.innerWidth / 1440, (window.innerHeight - GNB_H) / (810 - GNB_H)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <main className="fixed inset-0 overflow-hidden bg-canvas">
      <div
        className={`absolute top-0 left-1/2 h-[810px] w-[1440px] origin-top ${bleed ? "" : "overflow-hidden"}`}
        style={{ translate: `-50% ${GNB_H * (1 - scale)}px`, scale: String(scale) }}
      >
        {children}
      </div>
      {gnb && (
        <div className="absolute inset-x-0 top-0 z-30">
          <Gnb active={gnb} />
        </div>
      )}
    </main>
  );
}
