"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Breadcrumb from "../Breadcrumb";
import Stage from "./Stage";
import SuggestionCards from "./SuggestionCards";
import { ConnectedCard, ExperienceCard } from "../project-detail/Cards";
import type { ProjectTone } from "../projectColors";
import type { Story, StoryEntry } from "./stories";

/*
 * 성장 > 연결된 경험 자세히 보기 (Figma "성장" 섹션 장면 1~15)
 * 모든 요소를 한 번만 그리고, 장면이 바뀔 때 값(위치·기울기·크기·투명도)만 바꿔 CSS 전환으로 잇는다 (Smart Animate 방식).
 * 좌표는 Figma 1440×810 프레임 기준. 장면 사이 대기·전환 시간과 곡선은 Figma 프로토타입 값 그대로.
 * 내용(경험 카드 2~3장, 연결된 경험 카드, 공통점·판단·저장 문구)은 이야기 데이터(stories.ts)에서 받는다.
 */

type Ease = "gentle" | "slow" | "easeOut" | "linear";
const EASE: Record<Ease, string> = {
  gentle: "cubic-bezier(0.33, 1, 0.68, 1)",
  slow: "cubic-bezier(0.25, 1, 0.5, 1)",
  easeOut: "cubic-bezier(0.22, 0.61, 0.36, 1)",
  linear: "linear",
};

// 장면 k에 도착하는 전환(초·곡선)과 도착 후 다음 장면까지 대기(초).
// 반짝이는 문구가 있는 장면(6·7·13·14)은 빛이 한 번 왕복하는 걸 볼 수 있게 Figma보다 대기를 늘림
const FLOW: { in: number; ease: Ease; wait: number }[] = [
  { in: 0, ease: "gentle", wait: 0.1 }, // 1
  { in: 1.02, ease: "gentle", wait: 0.4 }, // 2 분홍 카드 떠오름
  { in: 1.02, ease: "gentle", wait: 0.4 }, // 3 파랑 카드
  { in: 1.02, ease: "gentle", wait: 0.8 }, // 4 주황 카드
  { in: 1, ease: "easeOut", wait: 0.5 }, // 5 흐려짐
  { in: 1.02, ease: "gentle", wait: 2.2 }, // 6 "새로운 연결을 발견했어요"
  { in: 1.02, ease: "gentle", wait: 2.8 }, // 7 설명
  { in: 1.53, ease: "gentle", wait: 0.5 }, // 8 모두 사라짐
  { in: 1.92, ease: "gentle", wait: 0 }, // 9 카드 3장 한 줄
  { in: 1.25, ease: "slow", wait: 0 }, // 10 스캔 시작
  { in: 2, ease: "linear", wait: 0.01 }, // 11 스캔 끝
  { in: 2.5, ease: "slow", wait: 0 }, // 12 왼쪽으로 겹쳐 쌓임
  { in: 1, ease: "easeOut", wait: 3 }, // 13 공통점
  { in: 4.17, ease: "slow", wait: 2.5 }, // 14 하나의 연결된 경험으로
  { in: 4.17, ease: "slow", wait: Infinity }, // 15 저장 안내
];
const LAST = FLOW.length;

// 진행 막대 5칸: 장(章)이 시작하는 장면. 이전·다음 버튼은 장 단위로 이동
const CHAPTERS = [1, 9, 12, 14, 15];
// 장 길이(초): 장 첫 장면 시작 ~ 다음 장 첫 장면 시작 = 장면별 (전환 + 대기) 합. 마지막 장은 전환 시간만
const sceneTime = (s: number) => FLOW[s - 1].in + (Number.isFinite(FLOW[s - 1].wait) ? FLOW[s - 1].wait : 0);
const CHAPTER_SEC = CHAPTERS.map((start, i) => {
  const end = CHAPTERS[i + 1] ?? LAST + 1;
  let t = 0;
  for (let s = start; s < end; s++) t += sceneTime(s);
  return t;
});
const chapterOf = (s: number) => CHAPTERS.filter((c) => c <= s).length - 1;

// 1부(장면 1~8) 카드 자리 3곳: 왼쪽 위·가운데 아래·오른쪽 (Figma 기본 이야기의 마케팅·자기소개서·밴드 자리).
// 카드가 2장이면 왼쪽 위·오른쪽 (Figma 181:1242 등). 기울기는 Figma relativeTransform [1, c; 0, d] + 장면별 y
const SLOTS = [
  { skew: [0.19, 0.98], card: { x: 385, y: (s: number) => (s === 1 ? 1048 : 168) }, glow: { x: 453.39, y: (s: number) => (s === 1 ? 1069 : 189.02) } },
  { skew: [0.19, 0.98], card: { x: 556.45, y: (s: number) => (s < 4 ? 843 : 409.23) }, glow: { x: 368, y: (s: number) => (s < 4 ? 912 : 478.23) } },
  { skew: [-0.22, 0.97], card: { x: 790.94, y: (s: number) => (s < 3 ? 921 : 215.23) }, glow: { x: 858, y: (s: number) => (s < 3 ? 932 : 226.23) } },
] as const;
const slotsFor = (n: number) => (n === 2 ? [SLOTS[0], SLOTS[2]] : SLOTS.slice(0, n));
// 카드 색별 1부 빛 (Figma 프로젝트 색)
const GLOW: Record<ProjectTone, [string, string]> = {
  pink: ["#ff7ac8", "#ffc5e7"],
  orange: ["#ffae6b", "#ffe9d7"],
  blue: ["#44bcf8", "#dbf3ff"],
  purple: ["#9a81ff", "#d8c5ff"],
};
// 2부(장면 9~15) 반듯한 카드: 263×300 → 12장면부터 219×250(0.833배)로 줄며 왼쪽에 겹침 → 14장면부터 한 자리에 모임.
// 한 줄(288.08 간격)과 겹침(89 간격)은 카드 수에 맞춰 가운데 정렬 (3장 기준 300 · 190 시작)
const part2 = (i: number, n: number, s: number): [number, number, number] =>
  s < 12
    ? [300 + (3 - n) * 144.04 + i * 288.08, 265, 1]
    : s < 14
      ? [190 + (3 - n) * 44.5 + i * 89, 295, 0.8333]
      : [339, 290, 0.8333];
export default function ConnectedStory({ story, startScene = 1 }: { story: Story; startScene?: number }) {
  const { title, cards } = story;
  const slots = slotsFor(cards.length);
  const [scene, setScene] = useState(startScene);
  // 마지막 장면에서 "성장의 순간으로 저장"을 누르면 제안 카드가 뜬다
  const [suggest, setSuggest] = useState(false);
  const [playing, setPlaying] = useState(true);
  // 버튼으로 건너뛸 때는 전환 없이 바로 그 장면으로
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    if (!playing || scene >= LAST) return;
    const f = FLOW[scene - 1];
    const t = setTimeout(
      () => {
        setInstant(false);
        setScene((s) => s + 1);
      },
      (f.in + f.wait) * 1000,
    );
    return () => clearTimeout(t);
  }, [scene, playing]);

  // 진행 막대 지금 칸을 처음부터 다시 채우기 위한 키 (버튼으로 이동할 때마다 바뀜)
  const [jumpKey, setJumpKey] = useState(0);
  const jump = (s: number) => {
    setInstant(true);
    setJumpKey((k) => k + 1);
    setScene(Math.max(1, Math.min(LAST, s)));
  };
  const ch = chapterOf(scene);
  const prev = () => jump(scene > CHAPTERS[ch] ? CHAPTERS[ch] : CHAPTERS[Math.max(0, ch - 1)]);
  const next = () => jump(CHAPTERS[Math.min(CHAPTERS.length - 1, ch + 1)]);

  const flow = FLOW[scene - 1];
  const tr = (props: string): CSSProperties =>
    instant
      ? { transition: "none" }
      : { transitionProperty: props, transitionDuration: `${flow.in}s`, transitionTimingFunction: EASE[flow.ease] };

  // 바뀌는 콘텐츠가 겹치지 않게: 사라지는 쪽이 먼저(최대 0.6초) 빠지고, 나타나는 쪽은 그 뒤 남은 시간 동안 (위치 이동은 그대로 전체 시간)
  const swap = (visible: boolean, extra = ""): CSSProperties => {
    if (instant) return { opacity: visible ? 1 : 0, transition: "none", pointerEvents: visible ? "auto" : "none" };
    const out = Math.min(flow.in / 2, 0.6);
    const op = visible ? `opacity ${flow.in - out}s ${EASE[flow.ease]} ${out}s` : `opacity ${out}s ${EASE.easeOut} 0s`;
    const rest = extra ? `, ${extra} ${flow.in}s ${EASE[flow.ease]}` : "";
    return { opacity: visible ? 1 : 0, transition: op + rest, pointerEvents: visible ? "auto" : "none" };
  };

  const part1 = scene <= 8;
  const part1Visible = scene <= 7;

  return (
    <Stage gnb="Growth">
      {/* 1부 빛 3개 (레이어 블러 300 → CSS blur 150px) */}
      {part1 &&
        cards.map((entry, i) => {
          const { glow: g, skew } = slots[i];
          const [c, d] = skew;
          const [from, to] = GLOW[entry.tone];
          return (
            <div
              key={`glow-${i}`}
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 size-[400px] origin-top-left blur-[150px]"
              style={{
                transform: `matrix(1, 0, ${c}, ${d}, ${g.x}, ${g.y(scene)})`,
                opacity: part1Visible ? 1 : 0,
                background: `radial-gradient(closest-side, ${from}99, ${to}99)`,
                ...tr("transform, opacity"),
              }}
            />
          );
        })}

      {/* 1부 기울어진 카드 (뒤 → 앞) */}
      {part1 &&
        cards.map((entry, i) => {
          const { card: pos, skew } = slots[i];
          const [c, d] = skew;
          return (
            <div
              key={`p1-${i}`}
              className="absolute top-0 left-0 origin-top-left"
              style={{
                transform: `matrix(1, 0, ${c}, ${d}, ${pos.x}, ${pos.y(scene)})`,
                opacity: part1Visible ? 1 : 0,
                ...tr("transform, opacity"),
              }}
            >
              <StoryCard entry={entry} />
            </div>
          );
        })}

      {/* 장면 5~7: 화면 전체가 뿌옇게 (Figma 배경 블러 25 → CSS 12.5px) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[rgba(244,245,247,0.5)] backdrop-blur-[12.5px]"
        style={{ opacity: scene >= 5 && scene <= 7 ? 1 : 0, ...tr("opacity") }}
      />

      <p
        className="text-shimmer absolute top-[355px] left-[569px] w-[303px] text-center text-[30px] leading-[45px] font-bold"
        style={swap(scene === 6 || scene === 7)}
      >
        새로운 연결을 발견했어요
      </p>
      <p
        className="absolute top-[412px] left-[220px] w-[1000px] text-center text-[18px] leading-[28.8px] font-medium whitespace-pre-line text-ink-muted"
        style={swap(scene === 7)}
      >
        {story.discovery}
      </p>

      {/* 2부 배경 빛 (장면 13~) */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[322px] left-[152px] size-[1136px]"
        style={{
          background: "radial-gradient(closest-side, #b8e5ff80, #b8e5ff00)",
          opacity: scene >= 13 ? 1 : 0,
          ...tr("opacity"),
        }}
      />

      {/* 2부 반듯한 카드 + 스캔 막대 */}
      {cards.map((entry, i) => {
        const [x, y, s] = part2(i, cards.length, scene);
        return (
          <div
            key={`p2-${i}`}
            className="absolute top-0 left-0 origin-top-left"
            style={{
              transform: `translate(${x}px, ${y}px) scale(${s})`,
              ...swap(scene >= 9 && scene < 14, "transform"),
            }}
          >
            <StoryCard entry={entry} />
          </div>
        );
      })}
      {cards.map((_, i) => (
        <div
          key={`scan-${i}`}
          aria-hidden
          className="pointer-events-none absolute w-[271px]"
          style={{
            left: part2(i, cards.length, 9)[0] - 3, // 카드보다 3px 왼쪽 (Figma 296·585·874)
            top: scene >= 11 ? 559 : 261,
            height: scene >= 11 ? 11 : 81,
            opacity: scene === 10 || scene === 11 ? 1 : 0,
            ...tr("top, height, opacity"),
          }}
        >
          <div className="absolute inset-x-0 top-[1px] bottom-0 bg-[linear-gradient(to_bottom,#fff,#fff0)]" />
          <div className="absolute inset-x-0 top-0 h-[6px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.08)]" />
        </div>
      ))}

      {/* 장면 14~: 세 경험이 하나의 연결된 경험 카드로 */}
      <div className="absolute top-[240px] left-[282px]" style={swap(scene >= 14)}>
        <ConnectedCard card={story.connected} />
      </div>

      {/* 오른쪽 문구: 13 공통점 / 14 판단 / 15 저장 안내 */}
      <Fade style={swap(scene === 13)} className="top-[336px]">
        <h2 className="text-shimmer w-fit text-[28px] leading-[42px] font-bold">
          스테디는 다음과 같은 공통점을 발견했습니다
        </h2>
        <ul className="mt-[24px] flex flex-col gap-[10px]">
          {story.common.map((t) => (
            <li
              key={t}
              className="flex h-[27px] items-center gap-[15px] text-[18px] leading-[27px] font-bold text-ink-muted"
            >
              <span className="flex size-[24px] items-center justify-center rounded-full bg-ink-sub">
                <svg width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden>
                  <path
                    d="M1 3.5L3.8 6L9 1"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {t}
            </li>
          ))}
        </ul>
      </Fade>

      <Fade style={swap(scene === 14)} className="top-[302px]">
        <h2 className="text-shimmer w-fit text-[28px] leading-[42px] font-bold whitespace-pre">
          {"스테디는 이 경험들이 하나의 성장 패턴으로\n이어질 가능성이 높다고 판단했습니다"}
        </h2>
        <p className="mt-[25px] text-[18px] leading-[28.8px] font-bold text-ink-muted">
          서로 다른 상황에서도 반복적으로 나타난 것은
        </p>
        <p className="mt-[2px] flex items-baseline gap-[1px] text-[18px] leading-[28.8px] font-bold text-ink-muted">
          {story.pattern.lead && <span className="mr-[5px]">{story.pattern.lead}</span>}
          <span className="bg-[linear-gradient(90deg,#292c2d,#85194e)] bg-clip-text text-[20px] leading-[32px] text-transparent">
            {story.pattern.highlight}
          </span>
          이었습니다
        </p>
        <p className="mt-[10px] text-[16px] leading-[25.6px] font-semibold text-disabled">
          {story.pattern.note}
          <br />
          사용자의 고유한 방식일 가능성이 있습니다
        </p>
      </Fade>

      <Fade style={swap(scene === 15)} className="top-[282px] w-[494px]">
        <p className="text-[18px] leading-[28.8px] font-bold text-ink-muted">이 연결을 성장의 순간으로 저장하면</p>
        <h2 className="text-shimmer mt-[20px] w-fit text-[28px] leading-[42px] font-bold whitespace-pre">
          {`나만의 성장패턴으로 축적되고\n${story.save}\n자동으로 이어 분석할 수 있습니다`}
        </h2>
        <button
          type="button"
          onClick={() => setSuggest(true)}
          className="absolute top-[220px] left-[328px] h-[46px] w-[166px] rounded-[30px] bg-ink text-[16px] leading-[20px] font-bold text-white shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
        >
          성장의 순간으로 저장
        </button>
      </Fade>

      {/* 위쪽: GNB 아래 흐림 띠 + 경로 */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[60px] left-0 h-[80px] w-[1440px] bg-[linear-gradient(to_bottom,#f4f5f7,#f4f5f700)]"
      />
      <div className="absolute top-[85px] left-[120px]">
        <Breadcrumb parent="연결된 경험" href="/growth" current={title} />
      </div>

      {/* 아래: 이전·재생/일시정지·다음, 건너뛰기, 진행 막대 5칸 */}
      <div className="absolute top-[718px] left-[120px] flex gap-[8px]">
        {/* Figma "재생 set": 30px 원, 아이콘 선 1.2 — 마우스를 올리거나 누르면 검정 바탕 + 흰 아이콘 */}
        <RoundButton label="이전" onClick={prev}>
          <path
            d="M16.5 11L11.5 15L16.5 19"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </RoundButton>
        <RoundButton label={playing ? "일시정지" : "재생"} onClick={() => setPlaying((p) => !p)}>
          {playing ? (
            <path d="M12.5 11V19M17.5 11V19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          ) : (
            <path
              d="M12 11.6C12 11.2 12.4 11 12.7 11.2L18.6 14.6C18.9 14.8 18.9 15.2 18.6 15.4L12.7 18.8C12.4 19 12 18.8 12 18.4Z"
              fill="currentColor"
            />
          )}
        </RoundButton>
        <RoundButton label="다음" onClick={next}>
          <path
            d="M13.5 11L18.5 15L13.5 19"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </RoundButton>
      </div>
      {scene < LAST && (
        <button
          type="button"
          onClick={() => jump(LAST)}
          className="absolute top-[718px] left-[1256px] h-[30px] w-[64px] rounded-[15px] bg-toggle text-[12px] leading-[15.6px] font-medium text-ink-muted transition-colors duration-200 hover:scale-100 hover:bg-ink hover:text-white"
        >
          건너뛰기
        </button>
      )}
      {/* 진행 막대 5칸: 지난 장은 꽉, 지금 장은 그 장 길이만큼 서서히 채워짐(일시정지하면 멈춤), 남은 장은 빈 칸 */}
      <div className="absolute top-[763px] left-[120px] flex w-[1200px] gap-[5px]">
        {CHAPTERS.map((_, i) => (
          <span key={i} className="relative h-[2px] flex-1 overflow-hidden bg-line">
            {i < ch && <span className="absolute inset-0 bg-ink" />}
            {i === ch && (
              <span
                key={`${ch}-${jumpKey}`}
                data-motion="keep"
                className="absolute inset-0 origin-left bg-ink"
                style={{
                  animation: `story-fill ${CHAPTER_SEC[i]}s linear forwards`,
                  animationPlayState: playing ? "running" : "paused",
                }}
              />
            )}
          </span>
        ))}
      </div>

      {/* 저장 후: 지금 화면을 흐리게 덮고(Figma 배경 블러 25 + #f4f5f7 50%) 제안 카드 캐러셀 */}
      <div
        className="absolute inset-0 bg-[rgba(244,245,247,0.5)] backdrop-blur-[12.5px] transition-opacity duration-350 ease-out"
        style={{ opacity: suggest ? 1 : 0, pointerEvents: suggest ? "auto" : "none" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute top-[60px] left-0 h-[80px] w-[1440px] bg-[linear-gradient(to_bottom,#f4f5f7,#f4f5f700)]"
        />
        <div className="absolute top-[85px] left-[120px]">
          <Breadcrumb parent="연결된 경험" href="/growth" current={title} />
        </div>
        {suggest && <SuggestionCards onLater={() => setSuggest(false)} />}
      </div>

    </Stage>
  );
}

// 이야기 카드 263×300 = 경험 카드(228×260)를 1.154배로
function StoryCard({ entry }: { entry: StoryEntry }) {
  return (
    <div className="h-[300px] w-[263.08px]">
      <div style={{ zoom: 263.08 / 228 }}>
        <ExperienceCard card={entry.card} tone={entry.tone} />
      </div>
    </div>
  );
}

function Fade({ style, className = "", children }: { style: CSSProperties; className?: string; children: ReactNode }) {
  return (
    <div className={`absolute left-[704px] ${className}`} style={style}>
      {children}
    </div>
  );
}

export function RoundButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="size-[30px] rounded-full bg-toggle text-ink-muted transition-colors duration-200 hover:scale-100 hover:bg-ink hover:text-white"
    >
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

