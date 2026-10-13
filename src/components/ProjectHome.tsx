"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import ProjectFolder, { type Project } from "./ProjectFolder";

type Status = "진행 중" | "종료";

const PROJECTS: (Project & { status: Status })[] = [
  { title: "마케팅 공모전", color: "pink", experiences: 32, hours: 2, startedAt: "2026.09.01", status: "진행 중" },
  { title: "자기소개서", color: "orange", experiences: 32, hours: 2, startedAt: "2026.09.01", status: "진행 중" },
  { title: "밴드 동아리", color: "blue", experiences: 32, hours: 2, startedAt: "2026.09.01", status: "진행 중" },
];

const STATUSES: Status[] = ["진행 중", "종료"];

export default function ProjectHome() {
  const [status, setStatus] = useState<Status>("진행 중");
  const projects = PROJECTS.filter((p) => p.status === status);
  const pill = useIndicator(STATUSES.indexOf(status));

  return (
    <main className="px-5 pt-[40px] pb-[80px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[50px]">
        <div className="flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
          <div className="flex flex-col gap-[18px] px-[10px]">
            <div className="flex flex-col gap-[5px]">
              <h1 className="text-[24px] leading-[34px] font-bold">내 프로젝트</h1>
              <p className="text-[14px] leading-[20px] font-semibold text-ink-muted">
                {projects.length}개의 프로젝트
              </p>
            </div>

            {/* 필터 칩: 검은 알약이 선택된 칩 뒤로 미끄러지고, 선택된 칩 호버 시 알약도 함께 확대 */}
            <div
              role="tablist"
              className="relative flex items-center gap-[8px] [&:has(>button[aria-selected=true]:hover)>span]:scale-108"
            >
              {pill.rect && (
                <span
                  aria-hidden
                  className={`absolute top-0 left-0 h-[36px] rounded-[20px] bg-ink ${SLIDE}`}
                  style={{ width: pill.rect.width, translate: `${pill.rect.left}px 0` }}
                />
              )}
              {STATUSES.map((s, i) => {
                const active = s === status;
                return (
                  <button
                    key={s}
                    ref={pill.ref(i)}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatus(s)}
                    className={`relative h-[36px] rounded-[20px] px-[14px] text-[14px] leading-[19.6px] font-semibold transition-[background-color,color,scale] duration-300 ${
                      active ? "text-white" : "bg-toggle text-ink-muted hover:text-ink"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
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
          <p className="px-[10px] text-[15px] font-semibold text-ink-muted">{status === "종료" ? "종료된" : "진행 중인"} 프로젝트가 없어요</p>
        )}
      </div>
    </main>
  );
}

const SLIDE = "transition-[translate,width,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

// 선택 표시(알약)가 index번째 칩 뒤로 미끄러지도록 위치·폭을 잰다 (웹폰트 로드 후 한 번 더)
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

  return { rect, ref: (i: number) => (el: HTMLElement | null) => void (els.current[i] = el) };
}
