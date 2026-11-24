"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import FeedbackCalendar, { dateKey } from "./FeedbackCalendar";
import type { ConnectionData, Feedback } from "./connectionData";
import FeedbackDetail from "./FeedbackDetail";
import FilterChips from "./FilterChips";
import { toneColors, type ProjectTone } from "./projectColors";

// 목업 기준 오늘 날짜
const TODAY = new Date(2026, 9, 27);

export default function ConnectionHome({ data }: { data: ConnectionData }) {
  const { projects, feedbacks: all, dots: allDots, detail } = data;
  const filters = ["전체", ...Object.keys(projects)];
  const [filter, setFilter] = useState("전체");
  const [selected, setSelected] = useState(TODAY);
  const [opened, setOpened] = useState<Feedback | null>(null);
  const close = useCallback(() => setOpened(null), []);
  // 선택한 날짜 + 프로젝트 필터에 맞는 피드백만
  const feedbacks = all.filter(
    (f) => f.day === dateKey(selected) && (filter === "전체" || f.project === filter),
  );
  // 프로젝트를 고르면 달력 점도 그 프로젝트 색만 남긴다 (Figma "커넥션 | 홈 (프로젝트 선택 시)")
  const dots =
    filter === "전체"
      ? allDots
      : Object.fromEntries(
          Object.entries(allDots).map(([day, colors]) => [day, colors.filter((c) => c === projects[filter])]),
        );

  return (
    <main className="px-5 pt-[40px] pb-[80px]">
      <div className="relative mx-auto max-w-[1200px]">
      {/* 상세 패널이 열리면 뒤 화면은 반투명 + 누르면 닫힘 */}
      <div
        inert={opened !== null}
        className={`flex flex-col gap-[50px] transition-opacity duration-300 ${opened ? "opacity-50" : ""}`}
      >
        <div className="flex flex-col gap-[18px] px-[10px]">
          <div className="flex flex-col gap-[5px]">
            <h1 className="text-[24px] leading-[34px] font-bold">내 피드백</h1>
            <p className="text-[14px] leading-[20px] font-semibold text-ink-muted">
              연결한 서비스에서 프로젝트별 피드백을 모았어요.
            </p>
          </div>
          <FilterChips items={filters} value={filter} onChange={setFilter} />
        </div>

        <div className="flex gap-[20px] max-lg:flex-col max-lg:items-center">
          <FeedbackCalendar dots={dots} today={TODAY} selected={selected} onSelect={setSelected} />

          {feedbacks.length > 0 ? (
            <ul className="flex min-w-0 flex-1 flex-col gap-[12px] max-lg:w-full">
              {feedbacks.map((f) => (
                <li key={f.id}>
                  <FeedbackItem feedback={f} color={projects[f.project]} onOpen={() => setOpened(f)} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-w-0 flex-1 flex-col items-center gap-[6px] pt-[181px] text-center font-semibold max-lg:pt-[60px]">
              <p className="text-[16px] leading-[20px] font-bold text-ink-sub">받은 피드백이 없어요</p>
              <p className="text-[14px] leading-[17.5px] text-ink-muted">피드백을 받으면 이곳으로 모여요</p>
            </div>
          )}
        </div>
      </div>

      {opened && (
        <>
          <div aria-hidden onClick={close} className="fixed inset-x-0 top-[60px] bottom-0 z-10" />
          {/* Figma: 피드백 목록 왼쪽 끝(본문 기준 470px)에서 시작해 오른쪽으로 70px 넘어가는 800×650 패널 */}
          <div className="z-20 lg:absolute lg:top-0 lg:left-[470px] max-lg:fixed max-lg:inset-x-5 max-lg:top-[80px] max-lg:flex max-lg:justify-center">
            <FeedbackDetail
              data={{ ...detail, project: opened.project, color: projects[opened.project] }}
              onClose={close}
            />
          </div>
        </>
      )}
      </div>
    </main>
  );
}

function FeedbackItem({ feedback: f, color, onOpen }: { feedback: Feedback; color: ProjectTone; onOpen: () => void }) {
  const c = toneColors(color);

  return (
    // 카드가 넓어 기본 호버(1.08배) 대신 1.02배만
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-end justify-between gap-[16px] rounded-[20px] bg-white px-[18px] py-[15px] text-left hover:scale-[1.02]"
    >
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
    </button>
  );
}
