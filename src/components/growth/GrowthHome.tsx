"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import FilterChips from "../FilterChips";
import { ConnectedCard } from "../project-detail/Cards";
import { GROWTH_CARDS } from "./growthCards";
import MomentGrid from "./MomentGrid";
import { MOMENT_TOTAL } from "./moments";
import Stage from "./Stage";

/*
 * 성장 홈 (Figma "성장 | 홈" 93:158)
 * 연결된 경험 카드가 아치 모양으로 펼쳐진 바퀴. 양옆 화살표를 누르면 카드가 아치를 따라 한 자리씩 이동한다.
 * Figma 카드는 3D 효과를 그림으로 굳힌 모양이라, 다섯 자리(왼쪽 끝 ~ 오른쪽 끝)의 네 꼭짓점을 그대로 가져와
 * 카드를 그 사각형에 원근 변형(matrix3d)으로 맞춘다. 자리 사이는 꼭짓점을 곡선으로 이어 부드럽게 움직인다.
 */

type Pt = [number, number];
type Quad = [Pt, Pt, Pt, Pt]; // 좌상, 우상, 우하, 좌하 (1440×810 프레임 좌표)

// Figma 다섯 자리의 꼭짓점 (둥근 모서리를 뺀 변의 연장선 교점)
const SLOTS: Record<number, Quad> = {
  [-2]: [
    [79.0, 60.4],
    [242.3, 142.3],
    [35.1, 314.1],
    [-127.6, 168.7],
  ],
  [-1]: [
    [302.2, 177.0],
    [506.4, 238.5],
    [401.5, 490.3],
    [142.2, 376.7],
  ],
  0: [
    [603.7, 253.0],
    [835.9, 253.0],
    [870.8, 533.0],
    [568.8, 533.0],
  ],
  1: [
    [933.6, 238.6],
    [1137.9, 176.9],
    [1297.8, 376.7],
    [1038.5, 490.3],
  ],
  2: [
    [1197.8, 142.2],
    [1361.2, 60.4],
    [1567.8, 168.7],
    [1405.1, 314.1],
  ],
};
// 화면 밖 자리(±3)는 아치를 이어서 추정 (2차 외삽)
const ext = (a: Quad, b: Quad, c: Quad): Quad =>
  a.map((p, i) => [3 * p[0] - 3 * b[i][0] + c[i][0], 3 * p[1] - 3 * b[i][1] + c[i][1]]) as Quad;
SLOTS[3] = ext(SLOTS[2], SLOTS[1], SLOTS[0]);
SLOTS[-3] = ext(SLOTS[-2], SLOTS[-1], SLOTS[0]);

// 자리별 투명도 (Figma: 가운데 1, 바로 옆 0.6, 끝 0.4)
const OPACITY: Record<number, number> = { [-3]: 0, [-2]: 0.4, [-1]: 0.6, 0: 1, 1: 0.6, 2: 0.4, 3: 0 };

// 가운데 카드 테두리: 흰색 → 카드 색 → 흰색 (Figma 피드백 카드 #78d0ff)
const RIM = { blue: "#78d0ff", pink: "#ffa1da", orange: "#ffae6b", purple: "#9c78ff" } as const;

const W = 280;
const H = 350;
const DURATION = 600;

// Catmull-Rom 곡선으로 자리 사이를 잇는다 (t: -3 ~ 3 사이 실수)
function quadAt(t: number): Quad {
  const i = Math.max(-3, Math.min(2, Math.floor(t)));
  const f = t - i;
  const get = (k: number) => SLOTS[Math.max(-3, Math.min(3, k))];
  const [p0, p1, p2, p3] = [get(i - 1), get(i), get(i + 1), get(i + 2)];
  const cr = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
  return p1.map((_, k) => [
    cr(p0[k][0], p1[k][0], p2[k][0], p3[k][0]),
    cr(p0[k][1], p1[k][1], p2[k][1], p3[k][1]),
  ]) as Quad;
}

function opacityAt(t: number) {
  const a = Math.max(-3, Math.min(3, t));
  const i = Math.max(-3, Math.min(2, Math.floor(a)));
  const f = a - i;
  return OPACITY[i] + (OPACITY[i + 1] - OPACITY[i]) * f;
}

// W×H 사각형을 네 꼭짓점으로 보내는 원근 변환(호모그래피)을 CSS matrix3d로
function toMatrix3d(q: Quad) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2,
    dx2 = x3 - x2,
    dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2,
    dy2 = y3 - y2,
    dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const h = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1,
    b = x3 - x0 + h * x3,
    c = x0;
  const d = y1 - y0 + g * y1,
    e = y3 - y0 + h * y3,
    f = y0;
  // 단위 정사각형 기준 → 카드 크기 기준으로
  return `matrix3d(${a / W},${d / W},0,${g / W},${b / H},${e / H},0,${h / H},0,0,1,0,${c},${f},0,1)`;
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

// 위 칩: 연결된 경험(카드 바퀴) · 성장의 순간(카테고리 카드, Figma 150:2171)
const TABS = [`연결된 경험 ${GROWTH_CARDS.length}`, `성장의 순간 ${MOMENT_TOTAL}`] as const;

const TAB_EVENT = "steadi:growth-tab";
const readTab = () => (new URLSearchParams(window.location.search).get("tab") === "moments" ? "moments" : "connected");
function subscribeTab(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(TAB_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(TAB_EVENT, onChange);
  };
}

export default function GrowthHome() {
  const n = GROWTH_CARDS.length;
  const [index, setIndex] = useState(0); // 가운데 카드 (목표)
  const [pos, setPos] = useState(0); // 지금 그려지는 위치 (움직이는 동안 실수)
  const [moved, setMoved] = useState(false); // 한 번이라도 넘겼는지 — 처음 들어올 땐 아래 제목을 바로 보여 준다
  const posRef = useRef(0);
  const anim = useRef<number | null>(null);
  // 고른 칩은 주소(?tab=moments)에 둔다: 카테고리 화면에서 뒤로 오면 성장의 순간이 열려 있도록.
  // useSearchParams는 Suspense가 필요해 Growth로 넘어올 때 빈 화면이 깜박여서, 주소를 직접 읽는다
  const tab = useSyncExternalStore(subscribeTab, readTab, () => "connected");
  const changeTab = (label: (typeof TABS)[number]) => {
    window.history.replaceState(null, "", label === TABS[1] ? "/growth?tab=moments" : "/growth");
    window.dispatchEvent(new Event(TAB_EVENT));
  };

  // pos를 target까지 0.6초 동안 감속하며 이동
  const goTo = useCallback((target: number) => {
    if (anim.current) cancelAnimationFrame(anim.current);
    const from = posRef.current;
    const start = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = (now: number) => {
      const k = reduce ? 1 : Math.min(1, (now - start) / DURATION);
      posRef.current = from + (target - from) * easeOut(k);
      setPos(posRef.current);
      if (k < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
    setIndex(target);
    setMoved(true);
  }, []);

  const move = useCallback((d: number) => goTo(Math.round(posRef.current) + d), [goTo]);

  useEffect(() => {
    if (tab !== "connected") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, tab]);

  const wrap = (v: number) => ((v % n) + n) % n;
  const active = GROWTH_CARDS[wrap(index)];

  // 연결된 경험: 카드 바퀴 + 아래 제목·화살표·자세히 보기·보관함
  const carousel = (
    <>
      {/* 카드 바퀴: 가운데에서 가까운 카드가 위로 */}
      {GROWTH_CARDS.map((card, i) => {
        let t = i - pos;
        t = t - Math.round(t / n) * n; // 가장 가까운 방향으로 (-n/2 ~ n/2)
        if (Math.abs(t) > 3) return null;
        const center = Math.max(0, 1 - Math.abs(t)); // 가운데에 가까운 정도
        const near = Math.round(t);
        return (
          <div
            key={i}
            className="absolute top-0 left-0 origin-top-left"
            style={{
              width: W,
              height: H,
              transform: toMatrix3d(quadAt(t)),
              opacity: opacityAt(t),
              zIndex: 10 - Math.round(Math.abs(t) * 2),
              cursor: near === 0 ? "default" : "pointer",
            }}
            onClick={() => near !== 0 && goTo(Math.round(pos) + near)}
          >
            <ConnectedCard card={card} />
            {/* 가운데 카드만 카드 색 테두리 */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[26px] p-[2px]"
              style={{
                opacity: center,
                background: `linear-gradient(135deg, #fff, ${RIM[card.tone]} 50%, #fff)`,
                mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
              }}
            />
          </div>
        );
      })}

      {/* 아래: 가운데 카드 제목 · 연결 수, 양옆 화살표, 자세히 보기 */}
      <div className="absolute top-[571px] left-0 z-20 flex w-[1440px] justify-center">
        <div
          key={wrap(index)}
          className={`flex flex-col items-center gap-[5px] ${moved ? "animate-[growth-fade_0.45s_ease-out]" : ""}`}
        >
          <p className="text-center text-[24px] leading-[33.6px] font-bold whitespace-pre">{active.title}</p>
          <p className="text-[14px] leading-[19.6px] font-semibold text-ink-muted">
            연결된 경험 {active.tags.length}개
          </p>
        </div>
      </div>
      <ArrowButton label="이전 경험" className="left-[463px]" onClick={() => move(-1)} flip />
      <ArrowButton label="다음 경험" className="left-[937px]" onClick={() => move(1)} />

      <Link
        href="/growth/connected"
        className="absolute top-[694px] left-[651px] z-20 flex h-[46px] items-center gap-[8px] rounded-[30px] bg-ink pr-[8px] pl-[18px] text-[16px] leading-[20.8px] font-semibold text-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-[scale] duration-200 hover:scale-108"
      >
        자세히 보기
        <span className="flex size-[30px] items-center justify-center rounded-full bg-white">
          <svg width="13" height="12" viewBox="0 0 13 12" fill="none" aria-hidden>
            <path
              d="M1 6H12M7 1L12 6L7 11"
              stroke="#1A1A1A"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>

      {/* 오른쪽 아래: 연결되지 않은 경험 카드 보관함 (눌렀을 때 갈 곳 미정) */}
      <div className="absolute top-[664px] left-[1187px] z-20 flex flex-col items-end">
        <span className="h-[30px] rounded-[15px] bg-toggle px-[12px] text-[12px] leading-[30px] font-medium text-ink-muted">
          연결되지 않은 경험 카드가 쌓여있어요!
        </span>
        <svg width="8" height="6" viewBox="0 0 8 6" className="mr-[29px]" aria-hidden>
          <path d="M0 0H8L4 6Z" fill="#EBEDEF" />
        </svg>
      </div>
      <button
        type="button"
        aria-label="연결되지 않은 경험 카드 보관함"
        className="absolute top-[710px] left-[1340px] z-20 flex size-[50px] items-center justify-center rounded-[16px] bg-white shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
      >
        <svg width="22" height="19" viewBox="0 0 22 19" fill="none" aria-hidden>
          <rect x="0.4" y="4.5" width="21.2" height="4.6" rx="1.6" fill="#292C2D" />
          <path d="M1.7 10.3H20.3V17C20.3 18 19.5 18.8 18.5 18.8H3.5C2.5 18.8 1.7 18 1.7 17V10.3Z" fill="#292C2D" />
          <path d="M8.5 13.4H13.5" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </button>
    </>
  );

  return (
    <Stage bleed gnb="Growth">
      {tab === "moments" ? <MomentGrid /> : carousel}

      {/* 위쪽: GNB 아래 흐림 띠 + 제목 · 칩 */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[60px] -left-[1000px] z-20 h-[80px] w-[3440px] bg-[linear-gradient(to_bottom,#f4f5f7,#f4f5f700)]"
      />
      <div className="absolute top-[100px] left-0 z-20 flex w-[1440px] flex-col items-center gap-[18px]">
        <div className="flex flex-col items-center gap-[5px]">
          <h1 className="text-[24px] leading-[33.6px] font-bold">내 경험</h1>
          <p className="text-[14px] leading-[19.6px] font-semibold text-ink-muted">3개의 프로젝트에서 모인 나의 경험</p>
        </div>
        <FilterChips items={TABS} value={TABS[tab === "moments" ? 1 : 0]} onChange={changeTab} />
      </div>

    </Stage>
  );
}

// 40px 원형 화살표 (Figma #ebedef 원 + #8e8f93 꺾쇠 1.2)
function ArrowButton({
  label,
  className,
  onClick,
  flip,
}: {
  label: string;
  className: string;
  onClick: () => void;
  flip?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-[598px] z-20 flex size-[40px] items-center justify-center rounded-full bg-toggle text-ink-muted transition-colors duration-200 hover:scale-100 hover:bg-ink hover:text-white ${className}`}
    >
      <svg
        width="8"
        height="13"
        viewBox="0 0 8 13"
        fill="none"
        style={{ transform: flip ? "scaleX(-1)" : undefined }}
        aria-hidden
      >
        <path
          d="M1.4 1L6.6 6.5L1.4 12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
