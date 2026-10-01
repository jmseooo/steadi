"use client";

import { useLayoutEffect, useRef, useState } from "react";

const TABS = ["경험 카드", "성장의 순간"];
// 선택된 칩은 테두리가 없어 2px 좁다 (Figma hug 폭 기준)
export const FILTERS = [
  { label: "연결된 경험", width: 98 },
  { label: "경험 카드", width: 84 },
  { label: "보관함", width: 68 },
] as const;

export type Filter = (typeof FILTERS)[number]["label"];
export type View = "wheel" | "grid";

// 원형 보기 아이콘: 반지름 8.5 원 위 30° 간격 점 12개 (SSR·브라우저 값 일치를 위해 반올림)
const round = (n: number) => Math.round(n * 1000) / 1000;
const WHEEL_DOTS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  return { cx: round(10 + 8.5 * Math.sin(a)), cy: round(10 - 8.5 * Math.cos(a)) };
});
// 격자 보기 아이콘: 6px 간격 3×3 점
const GRID_DOTS = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => ({ cx: 1.5 + c * 6, cy: 1.5 + r * 6 })));

export default function GrowthControls({
  filter,
  onFilterChange,
  view,
  onViewChange,
}: {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  view: View;
  onViewChange: (view: View) => void;
}) {
  const [tab, setTab] = useState(TABS[0]);
  const tabs = useIndicator(TABS.indexOf(tab));
  const chips = useIndicator(FILTERS.findIndex((f) => f.label === filter));

  return (
    <div className="pr-(--pad-r) pl-(--pad-l)">
      {/* 탭: 마지막 탭 오른쪽 여백(6)은 빼고 가운데 정렬 — Figma 탭 묶음(223) 기준 */}
      <div className="flex justify-center">
        <div role="tablist" className="relative -mr-[6px] flex gap-[54px]">
          {TABS.map((label, i) => {
            const active = tab === label;
            return (
              <button
                key={label}
                ref={tabs.ref(i)}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(label)}
                className="flex h-[36px] flex-col hover:scale-100"
              >
                <span
                  className={`block px-[6px] text-[18px] leading-[1.5] transition-colors duration-300 ${
                    active ? "font-semibold text-ink" : "font-medium text-ink-muted"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
          {tabs.rect && (
            <span
              aria-hidden
              className={`absolute bottom-0 left-0 h-[2px] bg-ink ${SLIDE}`}
              style={{ width: tabs.rect.width, translate: `${tabs.rect.left}px 0` }}
            />
          )}
        </div>
      </div>

      <div className="relative mt-[32px] flex justify-center">
        {/* 필터 칩: 검은 알약이 선택된 칩 뒤로 미끄러진다 */}
        <div className="relative flex gap-[10px] [&:has(>button[aria-pressed=true]:hover)>span]:scale-110">
          {chips.rect && (
            <span
              aria-hidden
              className={`absolute top-0 left-0 h-[40px] rounded-[21px] bg-ink ${SLIDE}`}
              style={{ width: chips.rect.width, translate: `${chips.rect.left}px 0` }}
            />
          )}
          {FILTERS.map(({ label, width }, i) => {
            const active = filter === label;
            return (
              <button
                key={label}
                ref={chips.ref(i)}
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange(label)}
                style={{ width: active ? width : width + 2 }}
                className={`relative h-[40px] rounded-[21px] border text-[15px] leading-[1.4] font-semibold transition-[color,border-color,scale] duration-300 ${
                  active ? "border-transparent text-white" : "border-line text-ink-sub hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 보기 전환: 칩과 같은 상태라 칩과 겹칠 만큼 좁은 화면(640 미만)에선 숨긴다 */}
        <div className="absolute -top-px right-0 flex h-[42px] w-[78px] items-center gap-[2px] rounded-[21px] bg-toggle p-[4px] max-sm:hidden lg:right-[60px]">
          <ViewButton label="원형 보기" active={view === "wheel"} onClick={() => onViewChange("wheel")}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
              {WHEEL_DOTS.map((d, i) => (
                <circle key={i} {...d} r="1.5" />
              ))}
            </svg>
          </ViewButton>
          <ViewButton label="격자 보기" active={view === "grid"} onClick={() => onViewChange("grid")}>
            <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden>
              {GRID_DOTS.map((d, i) => (
                <circle key={i} {...d} r="1.5" />
              ))}
            </svg>
          </ViewButton>
        </div>
      </div>
    </div>
  );
}

function ViewButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex size-[34px] items-center justify-center rounded-[17px] transition-[background-color,fill,box-shadow,scale] duration-300 ${
        active ? "bg-white fill-ink shadow-soft" : "fill-disabled"
      }`}
    >
      {children}
    </button>
  );
}

const SLIDE = "transition-[translate,width,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

// 선택 표시(밑줄·알약)가 index번째 요소 아래로 미끄러지도록 위치·폭을 잰다 (웹폰트 로드 후 한 번 더)
function useIndicator(index: number) {
  const els = useRef<(HTMLElement | null)[]>([]);
  const [rect, setRect] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = els.current[index];
      if (el) setRect({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    let cancelled = false;
    document.fonts.ready.then(() => !cancelled && measure());
    return () => {
      cancelled = true;
    };
  }, [index]);

  const ref = (i: number) => (el: HTMLElement | null) => {
    els.current[i] = el;
  };

  return { rect, ref };
}
