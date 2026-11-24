"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { Suggestion } from "./stories";

/*
 * 성장 > 연결된 경험 자세히 보기 > "성장의 순간으로 저장" 후 뜨는 제안 카드 (Figma "성장 | 제안카드" 63:13160)
 * 저장한 경험을 진행 중인 프로젝트에 어떻게 활용할지 프로젝트별 카드 3장을 캐러셀로 보여준다.
 * 좌표는 1440×810 프레임 기준: 가운데 카드 (470, 272) 500×340, 카드 간격 750.
 */

const GAP = 750; // 카드 중심 간격
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const MOVE = "0.4s cubic-bezier(0.77, 0, 0.175, 1)"; // 화면 안에서 옆으로 옮겨 가는 이동

export default function SuggestionCards({ suggestions, onLater }: { suggestions: Suggestion[]; onLater: () => void }) {
  const [active, setActive] = useState(1); // Figma 첫 화면: 가운데 마케팅 공모전
  const [holding, setHolding] = useState(false);
  const n = suggestions.length;
  // 직접 넘기면 멈춤을 풀고, 새 가운데 카드 위에 마우스가 있으면 그 카드가 다시 멈춤을 건다
  const move = (d: number) => {
    setHolding(false);
    setActive((a) => (a + d + n) % n);
  };
  const select = (i: number) => {
    setHolding(false);
    setActive(i);
  };

  // 5초마다 다음 카드로 자동으로 넘어가고, 가운데 카드에 마우스를 올린 동안은 멈춘다.
  // 카드가 바뀌면(자동·직접 모두) 5초를 처음부터 다시 센다
  useEffect(() => {
    if (holding) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % n), 5000);
    return () => clearTimeout(t);
  }, [active, holding, n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "Escape") onLater();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLater]);

  return (
    <>
      <h2 className="text-shimmer absolute top-[180px] left-0 w-[1440px] text-center text-[28px] leading-[42px] font-bold">
        저장한 경험을 진행 중인 프로젝트에서 활용해 볼까요?
      </h2>

      {suggestions.map((s, i) => {
        // 가운데 기준 -1·0·1 (3장이 돌아가며)
        let off = i - active;
        if (off > 1) off -= n;
        if (off < -1) off += n;
        return (
          <div
            key={s.label}
            className="absolute top-[272px] left-[470px]"
            style={{ translate: `${off * GAP}px 0`, transition: `translate ${MOVE}`, zIndex: off === 0 ? 2 : 1 }}
          >
            <Card s={s} center={off === 0} onSelect={() => select(i)} onHold={off === 0 ? setHolding : undefined} />
          </div>
        );
      })}

      {/* 가운데 카드의 행동 버튼 */}
      <div className="absolute top-[642px] left-0 flex w-[1440px] justify-center gap-[10px]">
        <button
          type="button"
          onClick={onLater}
          className="h-[46px] rounded-[30px] bg-[rgba(41,44,45,0.08)] px-[18px] text-[16px] leading-[20.8px] font-semibold text-ink-sub shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
        >
          다음에 활용하기
        </button>
        {/* 초안을 만든 뒤 이동할 곳은 미정 */}
        <button
          type="button"
          className="h-[46px] rounded-[30px] bg-ink px-[18px] text-[16px] leading-[20.8px] font-semibold text-white shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
        >
          {suggestions[active].action}
        </button>
      </div>
    </>
  );
}

// 카드 500×340. 마우스를 올리면 프로젝트 색 글로우(550px)가 커서를 따라가고, 카드가 커서 쪽으로 살짝 기운다
// (Figma "호버링 글로우" 레이어 + 3D 셰이더 카드 인터랙션 참고)
function Card({
  s,
  center,
  onSelect,
  onHold,
}: {
  s: Suggestion;
  center: boolean;
  onSelect: () => void;
  onHold?: (holding: boolean) => void; // 가운데 카드: 마우스를 올린 동안 자동 넘김 멈춤
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  // 마우스가 올라가 있는 카드가 가운데로 오면 바로 멈춤
  const hovering = hover !== null;
  useEffect(() => {
    if (center && hovering) onHold?.(true);
  }, [center, hovering, onHold]);

  const onMove = (e: MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    // 축소된 화면에서도 카드 기준 0~500, 0~340 좌표로
    setHover({ x: ((e.clientX - r.left) / r.width) * 500, y: ((e.clientY - r.top) / r.height) * 340 });
  };

  // 기본 글로우 위치: 카드 위쪽 가운데 (Figma: 중심 250, 0)
  const gx = hover?.x ?? 250;
  const gy = hover?.y ?? 0;
  const tiltX = hover ? ((hover.y - 170) / 170) * -4 : 0;
  const tiltY = hover ? ((hover.x - 250) / 250) * 5 : 0;

  return (
    <div style={{ perspective: 1200 }}>
      <div
        ref={ref}
        role={center ? undefined : "button"}
        tabIndex={center ? undefined : 0}
        aria-label={center ? undefined : `${s.label} 카드 보기`}
        onClick={center ? undefined : onSelect}
        onMouseMove={onMove}
        onMouseEnter={() => onHold?.(true)}
        onMouseLeave={() => {
          setHover(null);
          onHold?.(false);
        }}
        className={`relative h-[340px] w-[500px] overflow-hidden rounded-[52px] bg-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:scale-100 ${
          center ? "" : "cursor-pointer"
        }`}
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: hover ? "transform 0.15s ease-out" : `transform 0.4s ${EASE}`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute size-[550px] rounded-full blur-[25px]"
          style={{
            top: 0,
            left: 0,
            translate: `${gx - 275}px ${gy - 275}px`, // left·top 대신 GPU 이동
            background: `radial-gradient(closest-side, ${s.glow}80, ${s.glow}00)`,
            opacity: hover ? 1 : 0.85,
            transition: hover
              ? "translate 0.12s linear, opacity 0.3s"
              : `translate 0.4s ${EASE}, opacity 0.3s`,
          }}
        />

        <div className="relative px-[45px] pt-[40px]">
          <p className="text-[14px] leading-[21px] font-semibold opacity-70" style={{ color: s.accent }}>
            {s.label}
          </p>
          <h3
            className="mt-[8px] w-fit bg-clip-text text-[24px] leading-[33.6px] font-bold whitespace-pre text-transparent"
            style={{ backgroundImage: `linear-gradient(90deg, #292c2d, ${s.accent})` }}
          >
            {s.title}
          </h3>
          <p className="mt-[12px] text-[15px] leading-[22.5px] font-medium whitespace-pre text-ink-muted">{s.desc}</p>
          <div className="mt-[30px] flex flex-col items-start gap-[8px]">
            <Chip name="후보" value={s.candidates} bg="rgba(41,44,45,0.05)" />
            <Chip name="기준 예시" value={s.criteria} bg="rgba(41,44,45,0.03)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ name, value, bg }: { name: string; value: string; bg: string }) {
  return (
    <span
      className="flex h-[34px] items-center gap-[8px] rounded-[50px] px-[14px] text-[13px] leading-[17px] font-medium text-ink-sub"
      style={{ background: bg }}
    >
      {name}
      <span aria-hidden className="h-[10px] w-px bg-disabled" />
      {value}
    </span>
  );
}
