"use client";

import Image from "next/image";
import { useState } from "react";
import FilterChips from "../FilterChips";
import { PROJECT_COLORS } from "../projectColors";
import { Chip } from "./Changes";
import { HISTORY, PROJECT_NAME, SOURCE_NAME, type Source } from "./data";

// 스테디 히스토리 (Figma 100:3093): 450×484 흰 패널 안 목록을 스크롤, 아래 50px은 흰색으로 흐려진다
const FILTERS = ["전체", "진행중", "완료"] as const;

export default function History() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const items = HISTORY.filter((h) => filter === "전체" || (filter === "완료") === Boolean(h.time));

  return (
    <section className="flex w-full shrink-0 flex-col gap-[18px] lg:w-[450px]">
      <div className="flex flex-col gap-[12px] px-[10px]">
        <h2 className="flex items-center gap-[8px] text-[18px] leading-[25.2px] font-bold">
          스테디 히스토리
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="7.4" stroke="#8E8F93" strokeWidth="1.2" />
            <path d="M8 7.2V11.7" stroke="#8E8F93" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="4.9" r="0.85" fill="#8E8F93" />
          </svg>
        </h2>
        <FilterChips items={FILTERS} value={filter} onChange={setFilter} height={34} />
      </div>

      <div className="relative h-[484px] overflow-hidden rounded-[28px] bg-white">
        <ul className="flex h-full flex-col gap-[20px] overflow-y-auto px-[25px] pt-[22px] pb-[50px] [scrollbar-width:none]">
          {items.map((h) => {
            const color = PROJECT_COLORS[h.project];
            return (
              <li key={h.text} className="flex items-center gap-[16px]">
                <SourceIcon source={h.source} />
                <div className="flex min-w-0 flex-col gap-[5px]">
                  <div className="flex gap-[8px]">
                    {h.time ? (
                      <Chip className="rounded-[7px] bg-canvas font-bold text-ink-muted">
                        <span>완료</span>
                        <span>·</span>
                        <span>{h.time}</span>
                      </Chip>
                    ) : (
                      <Chip className="bg-disabled text-white">진행 중</Chip>
                    )}
                    <Chip style={{ background: color.tagBg, color: color.tagText }}>
                      <span>{SOURCE_NAME[h.source]}</span>
                      <span>·</span>
                      <span>{PROJECT_NAME[h.project]}</span>
                    </Chip>
                  </div>
                  <p className="text-[14px] leading-[18.9px] font-semibold text-ink-sub">{h.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[50px] bg-linear-to-b from-white/0 to-white" />
      </div>
    </section>
  );
}

// 출처 아이콘 22px. 노션은 그림자 여백(왼쪽 10·위 8) 포함 42px, 드라이브는 GNB 앱 아이콘(32px 타일 이미지)을 22에 맞춰 축소
function SourceIcon({ source }: { source: Source }) {
  return (
    <span className="relative size-[22px] shrink-0">
      {source === "notion" ? (
        <Image src="/assets/home/hist-notion.png" alt="노션" width={42} height={42} className="absolute -top-[8px] -left-[10px] size-[42px] max-w-none" />
      ) : source === "drive" ? (
        <Image src="/assets/app-drive.png" alt="Google Drive" width={29} height={29} className="absolute -top-[3.67px] -left-[7.33px] size-[29.33px] max-w-none" />
      ) : (
        <Image src={`/assets/home/hist-${source}.png`} alt={source === "kakao" ? "카카오톡" : "캘린더"} width={22} height={22} className="size-[22px] rounded-[6px]" />
      )}
    </span>
  );
}
