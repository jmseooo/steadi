"use client";

import { getImageProps } from "next/image";
import { useEffect } from "react";
import { GROWTH_CARDS } from "./growthCards";

// 성장 홈 첫 화면 카드(가운데 ±3장) 그림을 다른 화면에 있는 동안 미리 받아 둔다.
// 안 하면 Growth로 넘어간 뒤에야 받기 시작해서 그림 없는 카드가 잠깐 보였다가 채워진다(깜박임).
// 크기·주소는 ConnectedCard의 <Image>와 똑같이 맞춰야 같은 파일로 캐시된다
const FIRST_VIEW = [0, 1, 2, 3, -1, -2, -3].map((i) => GROWTH_CARDS.at(i)!);
const SOURCES = [
  ...new Set([
    ...FIRST_VIEW.map((c) => `/assets/cards/c${c.art}.png|195|235`),
    ...FIRST_VIEW.map((c) => `/assets/cards/glow-${c.tone}.png|280|313`),
    "/assets/cards/fade.png|280|221",
  ]),
];

let done = false;
export default function GrowthPreload() {
  useEffect(() => {
    if (done) return;
    const load = () => {
      done = true;
      for (const s of SOURCES) {
        const [src, w, h] = s.split("|");
        const { props } = getImageProps({ src, alt: "", width: Number(w), height: Number(h) });
        const img = new window.Image();
        if (props.srcSet) img.srcset = props.srcSet;
        img.src = props.src;
      }
    };
    // 지금 화면을 먼저 다 그린 뒤 한가할 때 (requestIdleCallback이 없는 브라우저는 1.5초 뒤)
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(load, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(load, 1500);
    return () => clearTimeout(id);
  }, []);
  return null;
}
