"use client";

import Image from "next/image";
import { useState } from "react";
import { DOT, type ProjectColor } from "./projectColors";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const key = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const sameDay = (a: Date, b: Date) => key(a) === key(b);

// 일요일 시작 주 단위로 채운 달력 (앞뒤 빈칸은 이전·다음 달 날짜)
function monthWeeks(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const last = new Date(year, month + 1, 0);
  const weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d)),
  );
}

export default function FeedbackCalendar({
  dots,
  today,
  selected,
  onSelect,
}: {
  dots: Record<string, ProjectColor[]>;
  today: Date;
  selected: Date;
  onSelect: (date: Date) => void;
}) {
  const [view, setView] = useState({ year: selected.getFullYear(), month: selected.getMonth() });
  const weeks = monthWeeks(view.year, view.month);
  const move = (delta: number) => {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };

  return (
    <section className="flex w-[450px] max-w-full shrink-0 flex-col gap-[18px] rounded-[36px] lg:self-start bg-white px-[42px] pt-[32px] pb-[42px] max-sm:px-[16px]">
      <div className="flex h-[48px] items-center justify-between">
        <ArrowButton label="이전 달" flip onClick={() => move(-1)} />
        <div className="flex w-[60px] flex-col items-center">
          <span className="text-[14px] leading-[19.6px] text-ink-muted">{view.year}</span>
          <span className="text-[20px] leading-[28px] font-semibold">{view.month + 1}월</span>
        </div>
        <ArrowButton label="다음 달" onClick={() => move(1)} />
      </div>

      <div className="mx-auto flex w-[365px] max-w-full flex-col gap-[7px]">
        <div className="flex justify-between">
          {WEEKDAYS.map((w) => (
            <span key={w} className="flex size-[28px] items-center justify-center text-[13px] leading-[18.2px] font-semibold text-disabled">
              {w}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-[22.5px]">
          {weeks.map((week) => (
            <div key={key(week[0])} className="flex justify-between">
              {week.map((day) => {
                const inMonth = day.getMonth() === view.month;
                const active = sameDay(day, selected);
                // 오늘은 회색 원, 다른 날을 고르면 그날이 검은 원 (Figma "오늘 기준 다른 날짜 선택시")
                const isToday = sameDay(day, today);
                return (
                  <div key={key(day)} className="flex w-[28px] flex-col items-center gap-[5px]">
                    <button
                      type="button"
                      aria-label={`${day.getMonth() + 1}월 ${day.getDate()}일`}
                      aria-pressed={active}
                      onClick={() => onSelect(day)}
                      className={`flex size-[28px] items-center justify-center rounded-[20px] text-[14px] leading-[19.6px] font-semibold transition-[background-color,color,scale] duration-300 ${
                        active ? "bg-ink text-white" : isToday ? "bg-disabled text-white" : inMonth ? "text-ink-muted" : "text-line"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                    <div className="flex h-[6px] items-center gap-[3px]">
                      {(dots[key(day)] ?? []).map((c) => (
                        <span key={c} className="size-[6px] rounded-full" style={{ background: DOT[c] }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 에셋은 40px 원형 배경 + 오른쪽 화살표 이미지. 이전 달은 좌우 반전
function ArrowButton({ label, flip, onClick }: { label: string; flip?: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="block size-[40px]">
      <Image src="/assets/btn-arrow.png" alt="" width={40} height={40} className={flip ? "-scale-x-100" : ""} />
    </button>
  );
}

export { key as dateKey };
