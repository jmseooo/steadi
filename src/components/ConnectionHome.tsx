"use client";

import Image from "next/image";
import { useState } from "react";
import FeedbackCalendar from "./FeedbackCalendar";
import FilterChips from "./FilterChips";
import { PROJECT_COLORS, type ProjectColor } from "./projectColors";

const PROJECTS: Record<string, ProjectColor> = {
  "마케팅 공모전": "pink",
  자기소개서: "orange",
  "밴드 동아리": "blue",
};
type ProjectName = keyof typeof PROJECTS;

const FILTERS = ["전체", ...Object.keys(PROJECTS)] as const;

type Feedback = { id: number; type: string; source: string; project: ProjectName; text: string; date: string };

const FEEDBACKS: Feedback[] = [
  { id: 1, type: "자리이동 요청", source: "카카오톡", project: "밴드 동아리", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)" },
  { id: 2, type: "자리이동 요청", source: "카카오톡", project: "마케팅 공모전", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)" },
  { id: 3, type: "자리이동 요청", source: "카카오톡", project: "마케팅 공모전", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)" },
  { id: 4, type: "자리이동 요청", source: "카카오톡", project: "자기소개서", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)" },
  { id: 5, type: "자리이동 요청", source: "카카오톡", project: "밴드 동아리", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)" },
];

// 날짜별 피드백이 있는 프로젝트 점 (Figma 2026년 10월 달력 기준)
const P = "pink", O = "orange", B = "blue";
const DOTS: Record<string, ProjectColor[]> = {
  "2026-9-27": [P, B], "2026-9-28": [P, O], "2026-9-29": [B], "2026-9-30": [B],
  "2026-10-1": [O, B], "2026-10-2": [P, B], "2026-10-3": [P, O],
  "2026-10-4": [P, B], "2026-10-5": [P, B], "2026-10-6": [P, B], "2026-10-9": [P, O], "2026-10-10": [P, B],
  "2026-10-11": [P, B], "2026-10-12": [P, B], "2026-10-14": [O, B], "2026-10-15": [P, B], "2026-10-16": [P], "2026-10-17": [P, B],
  "2026-10-18": [O, B], "2026-10-19": [P, B], "2026-10-20": [O, B], "2026-10-21": [P, B], "2026-10-23": [P, B], "2026-10-24": [P, B],
  "2026-10-25": [P, B], "2026-10-26": [P, B], "2026-10-27": [P, O, B],
};

export default function ConnectionHome() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [selected, setSelected] = useState(() => new Date(2026, 9, 27));
  const feedbacks = FEEDBACKS.filter((f) => filter === "전체" || f.project === filter);
  // 프로젝트를 고르면 달력 점도 그 프로젝트 색만 남긴다 (Figma "커넥션 | 홈 (프로젝트 선택 시)")
  const dots =
    filter === "전체"
      ? DOTS
      : Object.fromEntries(
          Object.entries(DOTS).map(([day, colors]) => [day, colors.filter((c) => c === PROJECTS[filter])]),
        );

  return (
    <main className="px-5 pt-[40px] pb-[80px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[50px]">
        <div className="flex flex-col gap-[18px] px-[10px]">
          <div className="flex flex-col gap-[5px]">
            <h1 className="text-[24px] leading-[34px] font-bold">내 피드백</h1>
            <p className="text-[14px] leading-[20px] font-semibold text-ink-muted">
              연결한 서비스에서 프로젝트별 피드백을 모았어요.
            </p>
          </div>
          <FilterChips items={FILTERS} value={filter} onChange={setFilter} />
        </div>

        <div className="flex gap-[20px] max-lg:flex-col max-lg:items-center">
          <FeedbackCalendar dots={dots} selected={selected} onSelect={setSelected} />

          <ul className="flex min-w-0 flex-1 flex-col gap-[12px] max-lg:w-full">
            {feedbacks.map((f) => (
              <li key={f.id}>
                <FeedbackItem feedback={f} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

function FeedbackItem({ feedback: f }: { feedback: Feedback }) {
  const c = PROJECT_COLORS[PROJECTS[f.project]];

  return (
    <article className="flex items-end justify-between gap-[16px] rounded-[20px] bg-white px-[18px] py-[15px]">
      <div className="flex min-w-0 flex-col gap-[6px]">
        <div className="flex items-center gap-[8px] text-[11px] leading-[15px]">
          <span className="flex h-[20px] items-center rounded-[8px] bg-canvas px-[6px] font-bold text-ink-muted">{f.type}</span>
          <span
            className="flex h-[20px] items-center gap-[2px] rounded-[6px] px-[6px] font-semibold"
            style={{ background: c.tagBg, color: c.tagText }}
          >
            <span>{f.source}</span>
            <span>·</span>
            <span>{f.project}</span>
          </span>
        </div>
        <p className="truncate px-[4px] text-[13px] leading-[18px] font-semibold text-ink-sub">{f.text}</p>
      </div>

      <div className="flex h-[44px] shrink-0 flex-col items-end justify-between">
        <span className="text-[11px] leading-[15px] font-semibold text-disabled">{f.date}</span>
        <Image src="/assets/icon-kakao.png" alt={f.source} width={22} height={22} className="rounded-[6px]" />
      </div>
    </article>
  );
}
