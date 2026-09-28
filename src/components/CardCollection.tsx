"use client";

import Image from "next/image";
import { useState } from "react";
import CardTile, { type TileData, type Tone } from "./CardTile";

const VISIBLE = 3;
const STEP = 330 + 20; // 카드 폭 + 간격
const TONE_CYCLE: Tone[] = ["coral", "magenta", "teal"];

const tile = (i: number, extra?: Partial<TileData>): TileData => ({
  tone: TONE_CYCLE[i % TONE_CYCLE.length],
  category: "공모전",
  source: "Notion",
  title: "전략안\n선택 기준 정리",
  summary: "정답이 보이지 않을 때,\n먼저 기준부터 세우시는 것 같아요",
  ...extra,
});

const NEW_TILES = Array.from({ length: 12 }, (_, i) => tile(i));
const SAVED_TILES = Array.from({ length: 6 }, (_, i) => tile(i, { bookmarked: i === 0 }));

// Figma "레이아웃 17" — 필터 '경험 카드'를 눌렀을 때의 목록.
// 프레임(810) 아래로 넘치는 목록은 이 영역 안에서 세로 스크롤된다.
export default function CardCollection() {
  // 한 번 누를 때 카드 한 장씩 밀리고, 양 끝에서는 반대쪽 끝으로 돌아간다.
  const [index, setIndex] = useState(0);
  const positions = NEW_TILES.length - VISIBLE + 1;
  const move = (delta: number) => setIndex((i) => (i + delta + positions) % positions);

  return (
    <div className="scrollbar-none absolute inset-x-0 top-[210px] bottom-0 overflow-y-auto">
      <div className="ml-[241px] w-[1030px] pt-[32px] pb-[60px]">
        <h2 className="flex h-[33px] items-center gap-[12px] px-[10px]">
          <span className="text-[22px] leading-[1.5] font-semibold text-ink">새로운 경험 카드</span>
          <span className="text-[20px] leading-[1.5] font-medium text-ink-muted">{NEW_TILES.length}</span>
        </h2>

        {/* 그림자(blur 30)가 잘리지 않도록 사방 40px 여유를 두고 자르고, 창 밖 카드는 투명하게 숨긴다 */}
        <div className="mt-[18px] [clip-path:inset(-40px)]">
          <div
            className="flex gap-[20px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${index * STEP}px)` }}
          >
            {NEW_TILES.map((t, i) => {
              const hidden = i < index || i >= index + VISIBLE;
              return (
                <div
                  key={i}
                  aria-hidden={hidden}
                  className={`transition-opacity duration-500 ${hidden ? "opacity-0" : ""}`}
                >
                  <CardTile tile={t} isNew />
                </div>
              );
            })}
          </div>
        </div>

        {/* 페이저 에셋은 그림자 여백(좌우 30, 위 26)을 포함한 116×92 이미지 */}
        <div className="relative mx-auto mt-[24px] h-[32px] w-[56px]">
          <Image
            src="/assets/card-pager.png"
            alt=""
            width={348}
            height={276}
            className="pointer-events-none absolute -top-[26px] -left-[30px] h-[92px] w-[116px] max-w-none"
          />
          <PagerButton side="prev" onClick={() => move(-1)} />
          <PagerButton side="next" onClick={() => move(1)} />
        </div>

        <button
          type="button"
          className="mt-[30px] ml-auto flex h-[39px] items-center gap-[8px] rounded-[20px] border border-line bg-canvas px-[15px] text-[14px] leading-[1.5] font-semibold text-ink-sub"
        >
          최신순
          <Image src="/assets/chevron-down.png" alt="" width={34} height={22} className="h-[7.33px] w-[11.33px]" />
        </button>

        <div className="mt-[24px] grid grid-cols-3 gap-x-[20px] gap-y-[30px]">
          {SAVED_TILES.map((t, i) => (
            <CardTile key={i} tile={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

// 이미지 위에 좌우 절반씩 투명 클릭 영역을 얹는다.
function PagerButton({ side, onClick }: { side: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={side === "prev" ? "이전 새 카드" : "다음 새 카드"}
      onClick={onClick}
      className={`absolute top-0 h-full w-1/2 ${side === "prev" ? "left-0" : "right-0"}`}
    />
  );
}
