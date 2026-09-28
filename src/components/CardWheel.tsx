"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import ExperienceCard, { type Badge, type Card } from "./ExperienceCard";

// 휠 중심 (755, 820), 반지름 460 — 카드 12장이 30° 간격으로 둘러선다.
const CENTER = { x: 755, y: 820 };
const RADIUS = 460;
const STEP = 30;

const pending = (color: string): Badge => ({ kind: "pending", color });
const DONE_TEAL: Badge = { kind: "done", background: "#f0fdfc", color: "#31cdd0" };
const DONE_GREEN: Badge = { kind: "done", background: "#eefde8", color: "#5be239" };

const WARM_3 = [
  { color: "pink", top: 3 },
  { color: "orange", top: 28 },
  { color: "teal", top: 53 },
] as const;
const COOL_4 = [
  { color: "purple", top: 3 },
  { color: "blue", top: 28 },
  { color: "mint", top: 53 },
  { color: "magenta", top: 78 },
] as const;
const two = (back: Card["layers"][number]["color"], front: Card["layers"][number]["color"]) => [
  { color: back, top: 3 },
  { color: front, top: 53 },
];

// 12시 방향부터 시계방향 순서
const CARDS: Card[] = [
  { layers: [...WARM_3], badge: pending("#126d73") },
  { layers: two("purple", "green"), badge: pending("#217912") },
  { layers: two("pink", "teal"), badge: DONE_TEAL },
  { layers: two("mint", "green"), badge: DONE_GREEN },
  { layers: two("orange", "pink"), badge: pending("#cc0a67") },
  { layers: two("purple", "green"), badge: pending("#217912") },
  { layers: [...WARM_3], badge: DONE_TEAL },
  { layers: [...COOL_4], badge: pending("#a815b6") },
  { layers: [...WARM_3], badge: pending("#126d73") },
  { layers: two("purple", "green"), badge: DONE_GREEN },
  { layers: two("orange", "pink"), badge: pending("#cc0a67") },
  { layers: [...COOL_4], badge: pending("#a815b6") },
];

// 화살표 에셋은 그림자 여백(좌우 30, 위 26)을 포함한 110px 이미지
function ArrowButton({ side, onClick }: { side: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={side === "prev" ? "이전 카드" : "다음 카드"}
      onClick={onClick}
      className={`absolute top-[579px] size-[50px] rounded-full ${side === "prev" ? "left-[517px]" : "left-[943px]"}`}
    >
      <Image
        src={`/assets/arrow-${side}.png`}
        alt=""
        width={110}
        height={110}
        className="pointer-events-none absolute -top-[26px] -left-[30px] size-[110px] max-w-none"
      />
    </button>
  );
}

export default function CardWheel({ children }: { children: ReactNode }) {
  const [rotation, setRotation] = useState(0);

  return (
    <>
      {/* 가운데 카드가 놓이는 홈 (안쪽 그림자 포함 에셋) */}
      <Image
        src="/assets/card-well.png"
        alt=""
        width={210}
        height={210}
        priority
        className="absolute top-[255px] left-[650px] size-[210px]"
      />

      {children}

      <ArrowButton side="prev" onClick={() => setRotation((r) => r + STEP)} />
      <ArrowButton side="next" onClick={() => setRotation((r) => r - STEP)} />

      <div
        className="pointer-events-none absolute transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ left: CENTER.x, top: CENTER.y, transform: `rotate(${rotation}deg)` }}
      >
        {CARDS.map((card, i) => (
          <div
            key={i}
            className="absolute -top-[80px] -left-[80px] rounded-[32px] shadow-soft"
            style={{ transform: `rotate(${i * STEP}deg) translateY(-${RADIUS}px)` }}
          >
            <ExperienceCard card={card} />
          </div>
        ))}
      </div>
    </>
  );
}
