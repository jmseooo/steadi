"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import FilterChips from "../FilterChips";
import { PROJECT_COLORS, type ProjectColor } from "../projectColors";
import { CHANGES, PROJECT_NAME, type Change } from "./data";

// 주요 변경 사항 (Figma 100:2970): 프로젝트 필터 + 237×237 카드 3열. X를 누르면 카드를 닫고 개수도 줄어든다
const ORDER: ProjectColor[] = ["pink", "orange", "blue"];
const CLOSE_MS = 220;

export default function Changes() {
  const [items, setItems] = useState(CHANGES);
  const [closing, setClosing] = useState<string[]>([]);
  const [filter, setFilter] = useState<ProjectColor | "all">("all");

  // 칩 글자에 남은 개수를 붙인다. 0개가 된 프로젝트 칩은 숨기고, 보던 필터면 전체로
  const count = (p: ProjectColor) => items.filter((c) => c.project === p).length;
  const projects = ORDER.filter((p) => count(p) > 0);
  const current = filter !== "all" && count(filter) === 0 ? "all" : filter;
  const labels = [`전체 ${items.length}`, ...projects.map((p) => `${PROJECT_NAME[p]} ${count(p)}`)];
  const keys: (ProjectColor | "all")[] = ["all", ...projects];

  const close = (id: string) => {
    setClosing((c) => [...c, id]);
    setTimeout(() => {
      setItems((list) => list.filter((c) => c.id !== id));
      setClosing((c) => c.filter((x) => x !== id));
    }, CLOSE_MS);
  };

  const shown = items.filter((c) => current === "all" || c.project === current);

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-[18px]">
      <div className="flex flex-col gap-[12px] px-[10px]">
        <h2 className="text-[18px] leading-[25.2px] font-bold">주요 변경 사항</h2>
        <FilterChips
          items={labels}
          value={labels[keys.indexOf(current)]}
          onChange={(label) => setFilter(keys[labels.indexOf(label)])}
          height={34}
        />
      </div>

      {shown.length > 0 ? (
        <ul className="grid grid-cols-1 gap-x-[9.5px] gap-y-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <li
              key={c.id}
              className="transition-[opacity,scale] ease-out"
              style={{ transitionDuration: `${CLOSE_MS}ms`, ...(closing.includes(c.id) && { opacity: 0, scale: 0.94 }) }}
            >
              <ChangeCard change={c} onClose={() => close(c.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="pt-[80px] text-center text-[16px] leading-[20px] font-bold text-ink-sub">새로운 변경 사항이 없어요</p>
      )}
    </section>
  );
}

// 작은 칩 20px (Figma 패딩 4·6·5·6, 11px)
export const Chip = ({ className = "", style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) => (
  <span
    className={`flex h-[20px] items-center gap-[2px] rounded-[6px] px-[6px] pt-[1px] text-[11px] leading-[14.3px] font-semibold whitespace-nowrap ${className}`}
    style={style}
  >
    {children}
  </span>
);

function ChangeCard({ change, onClose }: { change: Change; onClose: () => void }) {
  const color = PROJECT_COLORS[change.project];
  return (
    <article className="relative h-[237px] rounded-[24px] bg-white">
      <div className="absolute top-[20px] left-[20px] flex gap-[5px]">
        <Chip style={{ background: color.tagBg, color: color.tagText }}>{PROJECT_NAME[change.project]}</Chip>
        <Chip className="bg-canvas text-ink-muted">{change.kind}</Chip>
      </div>

      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-[15px] right-[15px] flex size-[28px] items-center justify-center rounded-full bg-line shadow-soft"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
          <path d="M0.5 0.5L7.5 7.5M7.5 0.5L0.5 7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="absolute top-[55px] left-[26px] flex flex-col gap-[4px] pr-[10px]">
        <h3 className="text-[16px] leading-[23.2px] font-semibold whitespace-pre-line">{change.title}</h3>
        <p className="text-[13px] leading-[18.2px] whitespace-pre-line text-ink-muted">{change.desc}</p>
      </div>

      <button
        type="button"
        className="absolute right-[20px] bottom-[20px] flex h-[38px] items-center gap-[8px] rounded-[20px] bg-canvas px-[14px] text-[14px] leading-[19.6px] font-medium text-ink-sub"
      >
        {change.action}
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden>
          <path d="M0.75 0.75L5 5L0.75 9.25" stroke="#B9BBC0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </article>
  );
}
