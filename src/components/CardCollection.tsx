"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import CardTile, { type TileData, type Tone } from "./CardTile";

// 카드는 최소 300px, 간격 20px. 줄 폭에 따라 한 줄에 3 → 2 → 1장 (아래 목록 그리드와 같은 기준)
const columnsFor = (width: number) => (width >= 940 ? 3 : width >= 620 ? 2 : 1);
// 카드 한 장 폭: (줄 폭 + 간격) / 칸 수 - 간격. 퍼센트 계산이 1/64px 단위로 내려가(330 → 329.98)
// 글자가 1px 밀리므로 정수 px로 반올림한다.
const CARD_WIDTH = "round(calc((100% + 20px) / var(--cols) - 20px), 1px)";
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

// Figma "레이아웃 17" — 필터 '경험 카드'를 눌렀을 때의 목록. 페이지와 함께 스크롤된다.
export default function CardCollection() {
  const carousel = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(3);

  useLayoutEffect(() => {
    const el = carousel.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setVisible(columnsFor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 한 번 누를 때 카드 한 장씩 밀리고, 양 끝에서는 반대쪽 끝으로 돌아간다.
  const [rawIndex, setIndex] = useState(0);
  const positions = NEW_TILES.length - visible + 1;
  const index = Math.min(rawIndex, positions - 1);
  const move = (delta: number) => setIndex((i) => (Math.min(i, positions - 1) + delta + positions) % positions);

  return (
    // 데스크톱에선 Figma처럼 본문 가운데보다 1px 오른쪽(x 241)에 놓는다
    <div className="pr-(--pad-r) pl-(--pad-l) pt-[42px] pb-[60px] lg:pl-[calc(var(--pad-l)+2px)]">
      <div className="mx-auto max-w-[1030px]">
        <h2 className="flex h-[33px] items-center gap-[12px] px-[10px]">
          <span className="text-[22px] leading-[1.5] font-semibold text-ink">새로운 경험 카드</span>
          <span className="text-[20px] leading-[1.5] font-medium text-ink-muted">{NEW_TILES.length}</span>
        </h2>

        {/* 그림자(blur 30)가 잘리지 않도록 사방 40px 여유를 두고 자르고, 창 밖 카드는 투명하게 숨긴다 */}
        {/* 카드 폭·이동 거리는 --cols(줄 폭 기준 컨테이너 쿼리)로 CSS가 계산해 첫 화면부터 맞는다 */}
        <div ref={carousel} className="@container mt-[18px] [clip-path:inset(-40px)]">
          <div
            className="flex gap-[20px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [--cols:1] @min-[620px]:[--cols:2] @min-[940px]:[--cols:3]"
            style={{ transform: `translateX(calc(${-index} * (${CARD_WIDTH} + 20px)))` }}
          >
            {NEW_TILES.map((t, i) => {
              const hidden = i < index || i >= index + visible;
              return (
                <div
                  key={i}
                  aria-hidden={hidden}
                  className={`shrink-0 transition-opacity duration-500 ${hidden ? "opacity-0" : ""}`}
                  style={{ width: CARD_WIDTH }}
                >
                  <CardTile tile={t} isNew />
                </div>
              );
            })}
          </div>
        </div>

        {/* 페이저 에셋은 그림자 여백(좌우 30, 위 26)을 포함한 116×92 이미지 */}
        {/* 클릭 영역은 투명 버튼이라, 호버 확대는 이미지를 감싼 틀 전체에 준다 */}
        <div className="relative mx-auto mt-[24px] h-[32px] w-[56px] transition-[scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110">
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

        <div className="mt-[24px] grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-[20px] gap-y-[30px]">
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
      className={`absolute top-0 h-full w-1/2 hover:scale-100 ${side === "prev" ? "left-0" : "right-0"}`}
    />
  );
}
