"use client";

import Image from "next/image";
import { useState } from "react";
import FilterChips from "./FilterChips";
import ProjectFolder, { type Project } from "./ProjectFolder";

type Status = "진행 중" | "종료";

const PROJECTS: (Project & { status: Status })[] = [
  { title: "마케팅 공모전", color: "pink", experiences: 32, hours: 2, startedAt: "2026.09.01", status: "진행 중", href: "/projects/marketing" },
  { title: "자기소개서", color: "orange", experiences: 32, hours: 2, startedAt: "2026.09.01", status: "진행 중" },
  { title: "밴드 동아리", color: "blue", experiences: 32, hours: 2, startedAt: "2026.09.01", status: "진행 중" },
];

const STATUSES: Status[] = ["진행 중", "종료"];

// 필터에 해당하는 프로젝트가 없을 때 문구 (종료는 Figma "프로젝트 | 홈 (예외 처리)" 기준)
const EMPTY: Record<Status, { title: string; desc: string }> = {
  "진행 중": { title: "아직 진행 중인 프로젝트가 없어요", desc: "새 프로젝트를 만들어 경험을 모아보세요" },
  종료: { title: "아직 종료된 프로젝트가 없어요", desc: "프로젝트가 종료되면 이곳으로 모아요" },
};

export default function ProjectHome() {
  const [status, setStatus] = useState<Status>("진행 중");
  const projects = PROJECTS.filter((p) => p.status === status);

  return (
    <main className="px-5 pt-[40px] pb-[80px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[50px]">
        <div className="flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
          <div className="flex flex-col gap-[18px] px-[10px]">
            <div className="flex flex-col gap-[5px]">
              <h1 className="text-[24px] leading-[34px] font-bold">내 프로젝트</h1>
              <p className="text-[14px] leading-[20px] font-semibold text-ink-muted">
                {PROJECTS.length}개의 프로젝트
              </p>
            </div>

            <FilterChips items={STATUSES} value={status} onChange={setStatus} />
          </div>

          <div className="flex flex-col items-end gap-[20px] max-sm:items-start">
            <button
              type="button"
              className="flex h-[36px] items-center gap-[10px] rounded-[10px] bg-ink-sub px-[16px] text-[14px] leading-[19.6px] font-semibold text-white"
            >
              {/* 아이콘 에셋은 선 두께 번짐(사방 0.67px) 포함 */}
              <span className="relative size-[10px]">
                <Image src="/assets/icon-plus.png" alt="" width={11} height={11} className="absolute -top-[0.67px] -left-[0.67px] size-[11.33px] max-w-none" />
              </span>
              새 프로젝트 만들기
            </button>

            <button
              type="button"
              className="flex h-[20px] items-center gap-[8px] text-[14px] leading-[20px] font-semibold text-ink-sub"
            >
              <span className="relative h-[13px] w-[12px]">
                <Image src="/assets/icon-sort.png" alt="" width={13} height={14} className="absolute -top-[0.67px] -left-[0.67px] h-[14.33px] w-[13.33px] max-w-none" />
              </span>
              최근 기록순
              <span className="relative h-[6px] w-[10px]">
                <Image src="/assets/icon-chevron-down.png" alt="" width={11} height={7} className="absolute -top-[0.67px] -left-[0.67px] h-[7.33px] w-[11.33px] max-w-none" />
              </span>
            </button>
          </div>
        </div>

        {projects.length > 0 ? (
          <ul className="flex flex-wrap gap-[24px]">
            {projects.map((p) => (
              <li key={p.title}>
                <ProjectFolder project={p} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-[6px] pt-[181px] text-center font-semibold">
            <p className="text-[16px] leading-[20px] font-bold text-ink-sub">{EMPTY[status].title}</p>
            <p className="text-[14px] leading-[17.5px] text-ink-muted">{EMPTY[status].desc}</p>
          </div>
        )}
      </div>
    </main>
  );
}

