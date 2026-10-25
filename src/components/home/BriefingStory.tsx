"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { RoundButton } from "../growth/ConnectedStory";
import { ConnectedCard, ExperienceCard, type ExperienceCardData } from "../project-detail/Cards";
import type { ProjectColor } from "../projectColors";
import { BRIEFING_CARDS } from "./data";

/*
 * 홈 > 브리핑 받기 (Figma "홈 브리핑" 155:7391, 장면 12개)
 * "브리핑 받을게요"를 누르면 오늘의 브리핑 박스가 1200×692로 커지고 그 안에서 재생된다.
 * 연결된 경험 자세히 보기(growth/ConnectedStory)와 같은 방식: 요소를 한 번만 그리고 장면마다 값만 바꿔 CSS 전환으로 잇는다.
 * Figma에 장면 사이 프로토타입 연결이 없어, 전환·대기 시간은 같은 흐름의 연결된 경험 장면 값을 그대로 쓴다.
 * 좌표는 박스(1200×692) 기준.
 */

type Ease = "gentle" | "slow" | "easeOut";
const EASE: Record<Ease, string> = {
  gentle: "cubic-bezier(0.33, 1, 0.68, 1)",
  slow: "cubic-bezier(0.25, 1, 0.5, 1)",
  easeOut: "cubic-bezier(0.22, 0.61, 0.36, 1)",
};

// 장면 k에 도착하는 전환(초·곡선)과 도착 후 대기(초)
const FLOW: { in: number; ease: Ease; wait: number }[] = [
  { in: 0, ease: "gentle", wait: 0.1 }, // 1
  { in: 1.02, ease: "gentle", wait: 0.4 }, // 2 분홍 카드 떠오름
  { in: 1.02, ease: "gentle", wait: 0.4 }, // 3 파랑 카드
  { in: 1.02, ease: "gentle", wait: 0.8 }, // 4 주황 카드
  { in: 1, ease: "easeOut", wait: 0.5 }, // 5 흐려짐
  { in: 1.02, ease: "gentle", wait: 2.2 }, // 6 "새로운 연결을 발견했어요"
  { in: 1.02, ease: "gentle", wait: 2.8 }, // 7 설명
  { in: 1.53, ease: "gentle", wait: 0.5 }, // 8 모두 사라짐
  { in: 1.92, ease: "gentle", wait: 2 }, // 9 카드 3장 한 줄
  { in: 2.5, ease: "slow", wait: 3 }, // 10 왼쪽으로 겹치며 공통점
  { in: 4.17, ease: "slow", wait: 2.5 }, // 11 하나의 연결된 경험으로
  { in: 2.5, ease: "slow", wait: Infinity }, // 12 브리핑 끝
];
const LAST = FLOW.length;

// 진행 막대 4칸: 장이 시작하는 장면. 마지막 장면(브리핑 끝)에선 모두 꽉 참
const CHAPTERS = [1, 9, 10, 11];
const sceneTime = (s: number) => FLOW[s - 1].in + FLOW[s - 1].wait;
const CHAPTER_SEC = CHAPTERS.map((start, i) => {
  const end = CHAPTERS[i + 1] ?? LAST;
  let t = 0;
  for (let s = start; s < end; s++) t += sceneTime(s);
  return t;
});
const chapterOf = (s: number) => (s >= LAST ? CHAPTERS.length : CHAPTERS.filter((c) => c <= s).length - 1);
const COUNTDOWN = 3; // 브리핑 끝 → 다음 브리핑까지

const CARDS: Record<"marketing" | "resume" | "band", { card: ExperienceCardData; tone: ProjectColor }> = {
  marketing: {
    tone: "pink",
    card: { tag: "마케팅 공모전", source: "notion", text: "캠페인 방향이 막연하게 느껴져\n타깃·문제·메시지를 나눠\n살피고 좁힐 대상을 정했어요" },
  },
  resume: {
    tone: "orange",
    card: { tag: "자기소개서", source: "notion", text: "경험을 글로 풀기 어려워\n상황·역할·행동을 나눠 적고\n설명이 부족한 부분을 찾았어요" },
  },
  band: {
    tone: "blue",
    card: { tag: "밴드 동아리", source: "kakao", text: "합주 소리가 어긋나는 구간을\n박자·음량·시작 신호로 나눠\n먼저 맞춰 볼 부분을 정했어요" },
  },
};
const ORDER = ["marketing", "resume", "band"] as const;

// 1부(장면 1~8): 기울어진 카드 218×248과 빛 331px. matrix(1, 0, c, d) + 장면별 y (아래에서 떠오름)
const SKEW = { marketing: [0.191, 0.982], resume: [0.191, 0.982], band: [-0.225, 0.974] } as const;
const PART1 = {
  marketing: { x: 320.1, y: (s: number) => (s === 1 ? 694 : 130) },
  resume: { x: 462, y: (s: number) => (s < 4 ? 693 : 329.7) },
  band: { x: 656.2, y: (s: number) => (s < 3 ? 698 : 169.1) },
};
const GLOWS = {
  marketing: { x: 376.7, y: (s: number) => (s === 1 ? 711.4 : 147.4), from: "#ff7ac8", to: "#ffc5e7" },
  resume: { x: 306, y: (s: number) => (s < 4 ? 750.1 : 386.9), from: "#ffae6b", to: "#ffe9d7" },
  band: { x: 711.7, y: (s: number) => (s < 3 ? 707.1 : 178.2), from: "#44bcf8", to: "#dbf3ff" },
};
// 2부(장면 9~11): 반듯한 카드 237×270 한 줄 → 왼쪽으로 겹침 → 한 자리에 모임
const PART2_X = {
  marketing: (s: number) => (s < 10 ? 222 : s < 11 ? 143 : 216),
  resume: (s: number) => (s < 10 ? 481.3 : s < 11 ? 199.8 : 217.8),
  band: (s: number) => (s < 10 ? 740.5 : s < 11 ? 256.5 : 219.5),
};

const STORY_CARD = BRIEFING_CARDS[1]; // 막연했던 어려움을 나눠, 먼저 바꿀 부분을 찾았어요 (82%)
const TITLE = "정답이 보이지 않을 때, 먼저 기준부터 세우는 편이에요";

export default function BriefingStory({ onClose, onNext }: { onClose: () => void; onNext: () => void }) {
  const [scene, setScene] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [instant, setInstant] = useState(false); // 버튼으로 건너뛸 때는 전환 없이 바로
  const [count, setCount] = useState(COUNTDOWN);

  useEffect(() => {
    if (!playing || scene >= LAST) return;
    const f = FLOW[scene - 1];
    const t = setTimeout(() => {
      setInstant(false);
      setScene((s) => s + 1);
    }, (f.in + f.wait) * 1000);
    return () => clearTimeout(t);
  }, [scene, playing]);

  // 브리핑 끝: 3초 세고 다음 브리핑으로 (일시정지하면 멈춤)
  useEffect(() => {
    if (scene < LAST || !playing) return;
    if (count === 0) {
      onNext();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [scene, playing, count, onNext]);

  const [jumpKey, setJumpKey] = useState(0);
  const jump = (s: number) => {
    setInstant(true);
    setJumpKey((k) => k + 1);
    setCount(COUNTDOWN);
    setScene(Math.max(1, Math.min(LAST, s)));
  };
  const ch = chapterOf(scene);
  const prev = () =>
    jump(scene >= LAST ? CHAPTERS[CHAPTERS.length - 1] : scene > CHAPTERS[ch] ? CHAPTERS[ch] : CHAPTERS[Math.max(0, ch - 1)]);
  const next = () => jump(ch + 1 < CHAPTERS.length ? CHAPTERS[ch + 1] : LAST);

  const flow = FLOW[scene - 1];
  const tr = (props: string): CSSProperties =>
    instant
      ? { transition: "none" }
      : { transitionProperty: props, transitionDuration: `${flow.in}s`, transitionTimingFunction: EASE[flow.ease] };
  // 사라지는 쪽이 먼저(최대 0.6초) 빠지고 나타나는 쪽은 그 뒤에 (위치 이동은 전체 시간)
  const swap = (visible: boolean, extra = ""): CSSProperties => {
    if (instant) return { opacity: visible ? 1 : 0, transition: "none", pointerEvents: visible ? "auto" : "none" };
    const out = Math.min(flow.in / 2, 0.6);
    const op = visible ? `opacity ${flow.in - out}s ${EASE[flow.ease]} ${out}s` : `opacity ${out}s ${EASE.easeOut} 0s`;
    const rest = extra ? `, ${extra} ${flow.in}s ${EASE[flow.ease]}` : "";
    return { opacity: visible ? 1 : 0, transition: op + rest, pointerEvents: visible ? "auto" : "none" };
  };

  const part1 = scene <= 8;
  const part1Visible = scene <= 7;
  const done = scene === LAST;

  return (
    <div className="relative h-[692px] w-[1200px] overflow-hidden rounded-[52px] bg-white">
      {/* 1부 빛 (레이어 블러 248 → CSS 124px) */}
      {part1 &&
        ORDER.map((k) => {
          const g = GLOWS[k];
          const [c, d] = SKEW[k];
          return (
            <div
              key={`glow-${k}`}
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 size-[331px] origin-top-left blur-[124px]"
              style={{
                transform: `matrix(1, 0, ${c}, ${d}, ${g.x}, ${g.y(scene)})`,
                opacity: part1Visible ? 1 : 0,
                background: `radial-gradient(closest-side, ${g.from}99, ${g.to}99)`,
                ...tr("transform, opacity"),
              }}
            />
          );
        })}
      {part1 &&
        ORDER.map((k) => {
          const [c, d] = SKEW[k];
          return (
            <div
              key={`p1-${k}`}
              className="absolute top-0 left-0 origin-top-left"
              style={{
                transform: `matrix(1, 0, ${c}, ${d}, ${PART1[k].x}, ${PART1[k].y(scene)})`,
                opacity: part1Visible ? 1 : 0,
                ...tr("transform, opacity"),
              }}
            >
              <StoryCard k={k} width={218} />
            </div>
          );
        })}

      {/* 2부 배경 빛 (장면 10~11 분홍, 12 주황 + 분홍) */}
      <Glow x={43} y={75} size={1114} color="#ff7ac866" style={swap(scene === 10 || scene === 11)} />
      <Glow x={-118} y={-191} size={691} color="#ffae6b4d" style={swap(done)} />
      <Glow x={227} y={-44} size={1114} color="#ff7ac84d" style={swap(done)} />

      {/* 장면 5~11: 박스 전체가 뿌옇게 (Figma 배경 블러 25 + #f4f5f7 50%) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[rgba(244,245,247,0.5)] backdrop-blur-[12.5px]"
        style={{ opacity: scene >= 5 && !done ? 1 : 0, ...tr("opacity") }}
      />

      <p
        className="text-shimmer absolute top-[292px] left-[459px] w-[283px] text-center text-[28px] leading-[42px] font-bold"
        style={swap(scene === 6 || scene === 7)}
      >
        새로운 연결을 발견했어요
      </p>
      <p
        className="absolute top-[349px] left-[263px] w-[675px] text-center text-[16px] leading-[26px] font-medium text-ink-muted"
        style={swap(scene === 7)}
      >
        최근 프로젝트를 분석하는 과정에서 이전에는 서로 다른 경험으로 남아 있던 기록들이
        <br />
        하나의 패턴으로 이어질 가능성을 발견했습니다
      </p>

      {/* 2부 반듯한 카드: 앞 카드가 위로 (밴드 > 자기소개서 > 마케팅) */}
      {ORDER.map((k) => (
        <div
          key={`p2-${k}`}
          className="absolute top-[211px] left-0"
          style={{ transform: `translateX(${PART2_X[k](scene)}px)`, ...swap(scene >= 9 && scene < 11, "transform") }}
        >
          <StoryCard k={k} width={237} />
        </div>
      ))}

      {/* 장면 11~: 세 경험이 하나의 연결된 경험 카드로 → 12에서 오른쪽으로 */}
      <div
        className="absolute top-0 left-0"
        style={{
          transform: done ? "translate(769px, 155px)" : "translate(196px, 168px)",
          ...swap(scene >= 11, "transform"),
        }}
      >
        <ConnectedCard card={STORY_CARD} />
      </div>

      {/* 오른쪽 문구: 10 공통점 / 11 판단 */}
      <div className="absolute top-[271px] left-[578px]" style={swap(scene === 10)}>
        <h2 className="text-shimmer w-fit text-[25.2px] leading-[37.8px] font-bold">스테디는 다음과 같은 공통점을 발견했습니다</h2>
        <ul className="mt-[21px] flex flex-col gap-[9px]">
          {["행동하기 전에 기준을 먼저 정의했어요", "여러 선택지를 같은 기준으로 비교했어요", "상황이 바뀌어도 기준을 유지하며 결정했어요"].map((t) => (
            <li key={t} className="flex h-[24px] items-center gap-[13px] text-[16px] leading-[24px] font-bold text-ink-muted">
              <span className="flex size-[21.6px] items-center justify-center rounded-full bg-ink-sub">
                <svg width="9" height="6" viewBox="0 0 10 7" fill="none" aria-hidden>
                  <path d="M1 3.5L3.8 6L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute top-[211px] left-[578px] w-[420px]" style={swap(scene === 11)}>
        <h2 className="text-shimmer w-fit text-[25.2px] leading-[37.8px] font-bold whitespace-pre">
          {"스테디는 이 경험들이 하나의 성장패턴으로\n이어질 가능성이 높다고 판단했습니다"}
        </h2>
        <p className="mt-[21px] text-[18px] leading-[28.8px] font-bold text-ink-sub">서로 다른 상황에서도 반복적으로 나타난 것은</p>
        <p className="mt-[2px] flex items-baseline gap-[1px] text-[18px] leading-[28.8px] font-bold text-ink-sub">
          <span className="bg-[linear-gradient(90deg,#292c2d,#85194e)] bg-clip-text text-[20px] leading-[32px] text-transparent">
            판단 기준을 먼저 세우는 방식
          </span>
          이었습니다
        </p>
        <p className="mt-[21px] text-[16px] leading-[25.6px] font-semibold text-ink-muted">
          이는 앞으로 비슷한 선택의 순간에서도 활용될 수 있는
          <br />
          사용자의 고유한 방식일 가능성이 있습니다
        </p>
      </div>

      {/* 장면 12: 브리핑 끝 */}
      <div className="absolute top-[271px] left-[70px] flex flex-col gap-[20px]" style={swap(done)}>
        <h2 className="w-fit bg-[linear-gradient(90deg,#1a1a1a,#8c0f49)] bg-clip-text text-[32px] leading-[44.8px] font-bold text-transparent">
          첫 번째 브리핑이 끝났어요
        </h2>
        <div className="flex gap-[10px]">
          <Link
            href="/growth/connected"
            className="flex h-[46px] items-center rounded-[30px] bg-[rgba(41,44,45,0.08)] px-[18px] text-[16px] leading-[22.4px] font-semibold text-ink-sub transition-[scale] duration-200 hover:scale-108"
          >
            자세히 보러가기
          </Link>
          <button
            type="button"
            onClick={onNext}
            className="flex h-[46px] items-center gap-[10px] rounded-[30px] bg-ink px-[18px] text-[16px] leading-[22.4px] font-semibold text-white"
          >
            다음 브리핑으로
            <Countdown key={`${jumpKey}-${done}`} count={count} running={done && playing} />
          </button>
        </div>
      </div>

      {/* 아래: 흰 페이드 위에 이전·재생·다음, 건너뛰기, 진행 막대 4칸 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[527px] h-[165px] bg-linear-to-b from-white/0 to-white opacity-60" />
      <div className="absolute top-[586px] left-[70px] flex gap-[8px]">
        <RoundButton label="이전" onClick={prev}>
          <path d="M16.5 11L11.5 15L16.5 19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </RoundButton>
        <RoundButton label={playing ? "일시정지" : "재생"} onClick={() => setPlaying((p) => !p)}>
          {playing ? (
            <path d="M12.5 11V19M17.5 11V19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          ) : (
            <path d="M12 11.6C12 11.2 12.4 11 12.7 11.2L18.6 14.6C18.9 14.8 18.9 15.2 18.6 15.4L12.7 18.8C12.4 19 12 18.8 12 18.4Z" fill="currentColor" />
          )}
        </RoundButton>
        <RoundButton label="다음" onClick={next}>
          <path d="M13.5 11L18.5 15L13.5 19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </RoundButton>
      </div>
      {!done && (
        <button
          type="button"
          onClick={() => jump(LAST)}
          className="absolute top-[586px] left-[1066px] h-[30px] w-[64px] rounded-[15px] bg-toggle text-[12px] leading-[15.6px] font-medium text-ink-muted transition-colors duration-200 hover:scale-100 hover:bg-ink hover:text-white"
        >
          건너뛰기
        </button>
      )}
      <div className="absolute top-[631px] left-[70px] flex w-[1060px] gap-[5px]">
        {CHAPTERS.map((_, i) => (
          <span key={i} className="relative h-[2px] flex-1 overflow-hidden bg-line">
            {i < ch && <span className="absolute inset-0 bg-ink" />}
            {i === ch && (
              <span
                key={`${ch}-${jumpKey}`}
                className="absolute inset-0 origin-left bg-ink"
                style={{ animation: `story-fill ${CHAPTER_SEC[i]}s linear forwards`, animationPlayState: playing ? "running" : "paused" }}
              />
            )}
          </span>
        ))}
      </div>

      {/* 위: 경로 · 닫기 */}
      <p className="absolute top-[52px] left-[70px] flex items-center gap-[10px] text-[15px] leading-[19.5px] font-semibold">
        <span className="text-disabled">오늘의 브리핑</span>
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden>
          <path d="M0.75 0.75L5 5L0.75 9.25" stroke="#B9BBC0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-ink-sub">{TITLE}</span>
      </p>
      <button
        type="button"
        aria-label="브리핑 닫기"
        onClick={onClose}
        className="absolute top-[32px] right-[32px] flex size-[42px] items-center justify-center rounded-full bg-disabled shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M1 1L11 11M11 1L1 11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

// 경험 카드(228×260)를 width에 맞춰 줄이거나 키운다
function StoryCard({ k, width }: { k: keyof typeof CARDS; width: number }) {
  return (
    <div style={{ zoom: width / 228 }}>
      <ExperienceCard card={CARDS[k].card} tone={CARDS[k].tone} />
    </div>
  );
}

function Glow({ x, y, size, color, style }: { x: number; y: number; size: number; color: string; style: CSSProperties }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left: x, top: y, width: size, height: size, background: `radial-gradient(closest-side, ${color}, transparent)`, ...style }}
    />
  );
}

// 다음 브리핑까지 남은 초: 흰 고리가 1초마다 줄어든다 (Figma 22px, 선 1.5)
function Countdown({ count, running }: { count: number; running: boolean }): ReactNode {
  const r = 10.25;
  const len = 2 * Math.PI * r;
  return (
    <span className="relative flex size-[22px] items-center justify-center text-[13px] leading-[16.9px] font-semibold">
      <svg width="22" height="22" viewBox="0 0 22 22" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="11" cy="11" r={r} fill="none" stroke="#fff" strokeWidth="1.5" />
        <circle
          cx="11"
          cy="11"
          r={r}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1.6"
          strokeDasharray={len}
          strokeDashoffset={len * (count / COUNTDOWN)}
          style={{ transition: running ? "stroke-dashoffset 1s linear" : "none" }}
        />
      </svg>
      {count}
    </span>
  );
}
