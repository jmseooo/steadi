"use client";

import { useState } from "react";

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

  return (
    <>
      {/* 탭 */}
      <div role="tablist" className="absolute top-[92px] left-[643.5px] flex gap-[54px]">
        {TABS.map((label) => {
          const active = tab === label;
          return (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(label)}
              className="flex h-[36px] flex-col justify-between"
            >
              <span
                className={`px-[6px] text-[18px] leading-[1.5] ${
                  active ? "font-semibold text-ink" : "font-medium text-ink-muted"
                }`}
              >
                {label}
              </span>
              <span className={`h-[2px] w-full ${active ? "bg-ink" : ""}`} />
            </button>
          );
        })}
      </div>

      {/* 필터 칩 */}
      <div className="absolute top-[160px] left-[618px] flex gap-[10px]">
        {FILTERS.map(({ label, width }) => {
          const active = filter === label;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(label)}
              style={{ width: active ? width : width + 2 }}
              className={`h-[40px] rounded-[21px] text-[15px] leading-[1.4] font-semibold ${
                active ? "bg-ink text-white" : "border border-line bg-canvas text-ink-sub"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 보기 전환 */}
      <div className="absolute top-[159px] left-[1252px] flex h-[42px] w-[78px] items-center gap-[2px] rounded-[21px] bg-toggle p-[4px]">
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
    </>
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
      className={`flex size-[34px] items-center justify-center rounded-[17px] ${
        active ? "bg-white fill-ink shadow-soft" : "fill-disabled"
      }`}
    >
      {children}
    </button>
  );
}
