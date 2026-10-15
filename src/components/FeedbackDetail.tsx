"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PROJECT_COLORS, type ProjectColor } from "./projectColors";

export type FeedbackDetailData = {
  project: string;
  color: ProjectColor;
  title: string;
  meta: string;
  original: string;
  summary: { label: string; text: string }[];
  suggestion: { title: string; desc: string; action: string; columns: { label: string; text: string }[] };
};

// Figma: 검정 → 파랑 가로 그라데이션 글자
const GRADIENT_TEXT = "w-fit bg-[linear-gradient(90deg,#1a1a1a,#0e9fe9)] bg-clip-text text-transparent";

// 스크롤 막대(250px)가 움직이는 거리 — Figma 처음·끝 화면에서 막대 위치 차이
const THUMB_TRAVEL = 184;

export default function FeedbackDetail({ data, onClose }: { data: FeedbackDetailData; onClose: () => void }) {
  const c = PROJECT_COLORS[data.color];
  const body = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const onScroll = () => {
    const el = body.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? el.scrollTop / max : 1);
  };

  useEffect(() => {
    onScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={data.title}
      className="relative flex h-[650px] w-[800px] max-w-full flex-col overflow-hidden rounded-[46px] bg-white px-[35px] pt-[35px] max-sm:px-[20px]"
    >
      <span
        className="flex h-[33px] w-fit items-center rounded-[16px] px-[12px] text-[13px] leading-[17px] font-semibold"
        style={{ background: c.chipBg, color: c.tagText }}
      >
        {data.project}
      </span>

      <div className="mt-[11px] flex flex-col gap-[5px] px-[6px]">
        <h2 className="text-[24px] leading-[36px] font-bold">{data.title}</h2>
        <p className="text-[14px] leading-[18px] font-semibold text-disabled">{data.meta}</p>
      </div>

      <div
        ref={body}
        onScroll={onScroll}
        className="mt-[25px] flex min-h-0 flex-1 flex-col gap-[25px] overflow-y-auto pb-[35px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <section className="flex flex-col gap-[10px]">
          <div className="flex h-[20px] items-center gap-[10px] px-[6px]">
            <h3 className="text-[13px] leading-[17px] font-semibold">피드백 원문</h3>
            <a href="#" className="group flex items-center gap-[6px]">
              {/* 노션 아이콘 에셋은 그림자 여백 포함 40×32 (타일은 왼쪽 10px) */}
              <span className="relative size-[20px]">
                <Image src="/assets/icon-notion.png" alt="" width={40} height={32} className="absolute top-0 -left-[10px] h-[32px] w-[40px] max-w-none" />
              </span>
              <span className="text-[13px] leading-[17px] font-semibold text-ink-muted transition-colors duration-300 group-hover:text-ink-sub">
                노션에서 열기
              </span>
              <Image src="/assets/btn-open-link.png" alt="" width={20} height={20} className="transition-[scale] duration-300 group-hover:scale-108" />
            </a>
          </div>
          <p className="rounded-[16px] bg-canvas px-[20px] py-[14px] text-[14px] leading-[21px] font-medium text-[#47484c]">
            {data.original}
          </p>
        </section>

        <section className="flex flex-col gap-[12px] px-[6px]">
          <div className="flex h-[22px] items-center gap-[8px]">
            <Image src="/assets/logo-mark.png" alt="" width={27} height={22} className="h-[22px] w-[27.25px]" />
            <h3 className="text-[13px] leading-[17px] font-semibold text-[#0e9fe9]">스테디가 정리한 내용</h3>
          </div>
          <div className="flex gap-[12px] px-[2px]">
            {/* 점 3개 + 점선 타임라인 에셋 (항목 3개 기준) */}
            <Image src="/assets/timeline-steps.png" alt="" width={22} height={144} className="h-[144px] w-[22px] shrink-0" />
            <ul className="flex flex-col gap-[16px]">
              {data.summary.map((s) => (
                <li key={s.label} className="flex flex-col gap-[2px] font-semibold">
                  <span className="text-[13px] leading-[22px] text-[#027fc7]">{s.label}</span>
                  <span className={`text-[14px] leading-[21px] ${GRADIENT_TEXT}`}>{s.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex shrink-0 flex-col gap-[20px] rounded-[22px] bg-canvas px-[24px] pt-[16px] pb-[24px]">
          <div className="flex items-center justify-between gap-[16px] max-md:flex-col max-md:items-start">
            <div className="flex flex-col">
              <h3 className={`text-[18px] leading-[28.8px] font-bold ${GRADIENT_TEXT}`}>{data.suggestion.title}</h3>
              <p className="text-[13px] leading-[20px] font-medium text-ink-muted">{data.suggestion.desc}</p>
            </div>
            <button
              type="button"
              className="h-[36px] shrink-0 rounded-[12px] bg-[#0e9fe9] px-[16px] text-[14px] leading-[20px] font-semibold text-white"
            >
              {data.suggestion.action}
            </button>
          </div>
          <div className="flex items-start gap-[10px] max-md:flex-col">
            {data.suggestion.columns.map((col) => (
              <div key={col.label} className="flex w-[312.5px] max-w-full gap-[10px]">
                <span className="w-[2.5px] shrink-0 bg-[#bae4fd]" />
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[12px] leading-[18px] font-semibold text-[#027fc7]">{col.label}</span>
                  <p className="text-[13px] leading-[20px] font-medium whitespace-pre-line text-[#47484c]">{col.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 아래쪽 흰 그라데이션: 더 내릴 내용이 있을 때만 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[100px] bg-[linear-gradient(to_top,#fff_15%,#fff0_35%)] transition-opacity duration-300"
        style={{ opacity: progress >= 0.99 ? 0 : 1 }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute top-[163px] right-[14px] h-[250px] w-[6px] rounded-[3px] bg-toggle max-sm:hidden"
        style={{ translate: `0 ${progress * THUMB_TRAVEL}px` }}
      />

      {/* 닫기 에셋은 그림자 여백 포함 102px (원은 왼쪽 30·위 26px) */}
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute top-[30px] right-[30px] size-[42px] rounded-full">
        <Image src="/assets/btn-close.png" alt="" width={102} height={102} className="pointer-events-none absolute -top-[26px] -left-[30px] size-[102px] max-w-none" />
      </button>
    </div>
  );
}
