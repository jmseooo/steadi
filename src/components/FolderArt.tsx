import Image from "next/image";
import type { ReactNode } from "react";
import { radial, toneColors, type ProjectTone } from "./projectColors";

export type FolderColor = ProjectTone | "gray";

// 폴더 안 종이 3장 (뒤 → 앞). 위치는 180×146 폴더 기준 px
const PAPERS = [
  { left: 27.53, top: 12.7, width: 124.94, height: 90 },
  { left: 21.18, top: 18, width: 137.65, height: 90 },
  { left: 13.76, top: 24.35, width: 152.47, height: 108 },
];
// 종이 색: 색 폴더는 진→연 회색, 회색 폴더는 앞 두 장이 같은 색 (Figma)
const PAPER_BG = {
  color: ["var(--color-line)", "var(--color-toggle)", "var(--color-canvas)"],
  gray: ["var(--color-toggle)", "var(--color-toggle)", "var(--color-canvas)"],
};

const BASE = 180;

// 폴더 그림(뒷면 + 종이 + 반투명 앞면). 180px 기준으로 그리고 size에 맞춰 zoom으로 통째로 줄인다
export default function FolderArt({ color, size = BASE, children }: { color: FolderColor; size?: number; children?: ReactNode }) {
  const back = color === "gray" ? "#d8dade" : radial(toneColors(color).from, toneColors(color).to);
  const papers = PAPER_BG[color === "gray" ? "gray" : "color"];

  return (
    <div className="relative h-[146.12px] w-[180px] shrink-0" style={{ zoom: size / BASE }}>
      <div className="absolute inset-0 rounded-[27.53px] opacity-90" style={{ background: back }} />
      {PAPERS.map((p, i) => (
        <div
          key={p.width}
          className="absolute rounded-[14.82px] shadow-[inset_0_0_15.88px_#fff,0_2.12px_31.76px_rgba(0,0,0,0.05)]"
          style={{ left: p.left, top: p.top, width: p.width, height: p.height, background: papers[i] }}
        />
      ))}
      {/* 앞면 에셋은 블러 번짐 여백(180 기준 사방 10.67px)을 포함한 이미지 */}
      <Image
        src={`/assets/folder-front-${color}.png`}
        alt=""
        width={201}
        height={134}
        className="pointer-events-none absolute top-[23.17px] -left-[10.67px] h-[133.67px] w-[201.33px] max-w-none"
      />
      {children}
    </div>
  );
}

// 색 폴더 제목 (180 기준 위치·크기)
export function FolderTitle({ color, children }: { color: ProjectTone; children: ReactNode }) {
  return (
    <span
      className="absolute top-[103.77px] left-[23.29px] text-[17px] leading-[23.8px] font-semibold whitespace-nowrap"
      style={{ color: toneColors(color).title }}
    >
      {children}
    </span>
  );
}
