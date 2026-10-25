"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ConnectedCard } from "../project-detail/Cards";
import { PROJECT_COLORS } from "../projectColors";
import BriefingStory from "./BriefingStory";
import { BRIEFING_CARDS } from "./data";

/*
 * 오늘의 브리핑 (Figma 100:3260, 1200×530)
 * 오른쪽 466 패널의 카드 묶음: 맨 앞 카드를 클릭하거나 옆으로 던지면 날아갔다가 맨 뒤로 들어가고,
 * 나머지는 한 칸씩 앞으로 온다 (Figma Make "Simple Card Stack" 참고).
 * 박스 배경 빛과 제목 그라데이션 끝색은 맨 앞 카드의 프로젝트 색을 따라 바뀐다 (globals.css --brief-tint).
 * "브리핑 받을게요"를 누르면 박스가 1200×692로 커지며 브리핑이 재생된다 (BriefingStory).
 */

// 카드 자리 (패널 기준 좌상단 + 회전, 카드 가운데 기준 회전). 0 맨 앞 · 1 가운데 · 2 맨 뒤
const SLOTS = [
  { x: 104.32, y: 76.81, r: -1.23 },
  { x: 104.23, y: 48.93, r: 5.18 },
  { x: 79.18, y: 48.59, r: -4.11 },
];
const PANEL = 466;
const THROW = 90; // 이만큼 끌면 던져진다
const FLY = { x: 300, r: 16 }; // 던져진 카드가 날아가는 거리·기울기
const FLY_MS = 320;
const SETTLE = "translate 0.6s cubic-bezier(0.34, 1.3, 0.64, 1), rotate 0.6s cubic-bezier(0.34, 1.3, 0.64, 1)";

export default function Briefing() {
  const [order, setOrder] = useState(() => BRIEFING_CARDS.map((_, i) => i)); // order[0] = 맨 앞 카드
  const [flying, setFlying] = useState<{ card: number; dir: 1 | -1 } | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [panelRef, scale] = usePanelScale();
  const [story, setStory] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  // 맨 앞 카드를 던진다: 날아간 뒤 맨 뒤로. 날아가는 순간 배경색은 다음 카드 색으로 바뀌기 시작
  const fling = (dir: 1 | -1) => {
    if (flying) return;
    setDrag(null);
    setFlying({ card: order[0], dir });
    timer.current = setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]]);
      setFlying(null);
    }, FLY_MS);
  };

  const front = BRIEFING_CARDS[flying ? order[1] : order[0]];
  const tint = PROJECT_COLORS[front.tone];

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (flying) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    const x = (e.clientX - s.x) / scale;
    const y = (e.clientY - s.y) / scale;
    if (!s.moved && Math.hypot(x, y) < 5) return;
    s.moved = true;
    setDrag({ x, y });
  };
  const onPointerUp = () => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (!s.moved) return fling(1); // 클릭
    if (drag && Math.abs(drag.x) > THROW) return fling(drag.x > 0 ? 1 : -1);
    setDrag(null); // 덜 끌었으면 제자리로
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      fling(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      fling(-1);
    }
  };

  if (story)
    return (
      <StorySection
        onClose={() => setStory(false)}
        onNext={() => {
          // 다음 브리핑: 박스를 닫고 카드 묶음을 한 장 넘긴다
          setStory(false);
          setOrder((o) => [...o.slice(1), o[0]]);
        }}
      />
    );

  return (
    <section
      aria-label="오늘의 브리핑"
      className="brief-tint relative overflow-hidden rounded-[52px] bg-white break-keep lg:h-[530px]"
      style={{ "--brief-tint": tint.from, "--brief-title": tint.title } as CSSProperties}
    >
      {/* 배경 빛: Figma 1893 원(가운데 946.5, 497.5)의 방사형 그라데이션 색 30% → 0% */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle 946.5px at 78.875% 93.87%, color-mix(in srgb, var(--brief-tint) 30%, transparent), transparent)",
        }}
      />
      <Image
        src="/assets/home/decor-lines-brief.png"
        alt=""
        width={473}
        height={415}
        className="pointer-events-none absolute top-[115px] left-0 h-[415px] w-[473.05px] max-w-none"
      />

      <div className="relative flex flex-col gap-[40px] px-[24px] pt-[40px] pb-[32px] sm:px-[70px] sm:pt-[52px] lg:block lg:p-0">
        <p className="text-[15px] leading-[19.5px] font-semibold text-ink-sub lg:absolute lg:top-[52px] lg:left-[70px]">
          오늘의 브리핑
        </p>

        <div className="lg:absolute lg:top-[278px] lg:left-[70px]">
          <p className="text-[20px] leading-[29px] font-semibold text-ink-sub">다은님의 경험 사이에서</p>
          <h2
            className="mt-[5px] w-fit bg-clip-text text-[26px] leading-[1.4] font-bold text-transparent sm:text-[32px] sm:leading-[44.8px]"
            style={{ backgroundImage: "linear-gradient(90deg, #1a1a1a, var(--brief-title))" }}
          >
            새로운 연결 3가지를 찾았어요
          </h2>
          <p className="mt-[5px] text-[16px] leading-[1.45] text-ink-muted sm:text-[18px] sm:leading-[26.1px]">
            서로 다른 프로젝트에서 비슷하게 행동했던 순간을 정리했어요
          </p>
          <button
            type="button"
            onClick={() => setStory(true)}
            className="mt-[35px] flex h-[46px] w-fit items-center rounded-[30px] bg-ink px-[18px] text-[16px] leading-[22.4px] font-semibold text-white transition-[scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-108"
          >
            브리핑 받을게요
          </button>
        </div>

        {/* 카드 패널 466×466: 좁은 화면에선 폭에 맞춰 통째로 줄인다 */}
        <div ref={panelRef} className="relative mx-auto aspect-square w-full max-w-[466px] lg:absolute lg:top-[32px] lg:right-[32px] lg:w-[466px]">
          <div
            className="absolute top-0 left-0 origin-top-left rounded-[24px] bg-white/30"
            style={{ width: PANEL, height: PANEL, scale }}
          >
            {order.map((card, slot) => {
              const isFront = slot === 0;
              const fly = flying?.card === card ? flying : null;
              const s = SLOTS[slot];
              let x = s.x;
              let y = s.y;
              let r = s.r;
              if (fly) {
                x += fly.dir * FLY.x;
                r += fly.dir * FLY.r;
              } else if (isFront && drag) {
                x += drag.x;
                y += drag.y * 0.4;
                r += drag.x * 0.05;
              }
              const dragging = isFront && drag && !fly;
              return (
                <div
                  key={card}
                  className={`absolute top-0 left-0 touch-none select-none ${isFront ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
                  style={{
                    translate: `${x}px ${y}px`,
                    rotate: `${r}deg`,
                    zIndex: fly ? 4 : SLOTS.length - slot,
                    transition: dragging ? "none" : fly ? `translate ${FLY_MS}ms ease-in, rotate ${FLY_MS}ms ease-in` : SETTLE,
                  }}
                  {...(isFront && {
                    tabIndex: 0,
                    "aria-label": "다음 카드 보기",
                    onPointerDown,
                    onPointerMove,
                    onPointerUp,
                    onPointerCancel: onPointerUp,
                    onKeyDown,
                  })}
                >
                  <ConnectedCard card={BRIEFING_CARDS[card]} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// 브리핑 재생 화면 크기 (Figma 박스 1200×692). 좁은 화면에선 폭에 맞춰 통째로 줄인다
const STORY_W = 1200;
const STORY_H = 692;

// 박스를 폭과 창 높이 둘 다에 맞춰 줄인다: 박스 아래가 화면 밖으로 넘치지 않게 (Figma: 위 80 · 아래 38 여백)
const STORY_TOP = 80;
const STORY_BOTTOM = 38;

function StorySection({ onClose, onNext }: { onClose: () => void; onNext: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () =>
      setScale(Math.min(1, el.clientWidth / STORY_W, Math.max(0.5, (window.innerHeight - STORY_TOP - STORY_BOTTOM) / STORY_H)));
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);
  return (
    <div ref={ref} className="w-full">
      <section
        aria-label="오늘의 브리핑"
        className="relative mx-auto animate-[brief-grow_0.6s_cubic-bezier(0.22,1,0.36,1)] overflow-hidden rounded-[52px] bg-white break-keep"
        style={{ width: STORY_W * scale, height: STORY_H * scale, borderRadius: 52 * scale }}
      >
        <div className="absolute top-0 left-0 origin-top-left animate-[growth-fade_0.6s_ease-out]" style={{ scale }}>
          <BriefingStory onClose={onClose} onNext={onNext} />
        </div>
      </section>
    </div>
  );
}

// 패널을 담는 칸의 폭 / 466 (데스크톱은 1)
function usePanelScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setValue(Math.min(1, el.clientWidth / PANEL)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, value] as const;
}
