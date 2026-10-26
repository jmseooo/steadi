"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

// 화면별 강조색: 제목·진행 막대 그라데이션 끝색 (Figma)
export const ACCENT_END = { default: "#8c0f49", pink: "#8c0f49", orange: "#7e2610", blue: "#084872", purple: "#280c69" } as const;
export type Accent = keyof typeof ACCENT_END;

// 검정 → 강조색 가로 그라데이션 글자
export function GradientText({ accent = "default", className = "", children }: { accent?: Accent; className?: string; children: ReactNode }) {
  return (
    <span
      className={`w-fit bg-clip-text text-transparent transition-[background-image] duration-500 ${className}`}
      style={{ backgroundImage: `linear-gradient(90deg, #1a1a1a, ${ACCENT_END[accent]})` }}
    >
      {children}
    </span>
  );
}

export function Heading({ title, desc, accent }: { title: string; desc: string; accent?: Accent }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <h1 className="flex text-[24px] leading-[33.6px] font-bold">
        <GradientText accent={accent}>{title}</GradientText>
      </h1>
      <p className="text-[16px] leading-[23.2px] font-semibold whitespace-pre-line text-ink-muted">{desc}</p>
    </div>
  );
}

// 상단 진행 막대 (711px, 채움은 검정 → 강조색). 폭 대신 가로 배율로 늘려 GPU에서 움직인다
export function ProgressBar({ value, accent = "default" }: { value: number; accent?: Accent }) {
  return (
    <div className="absolute top-[50px] left-[365px] h-[2px] w-[711px] rounded-[5px] bg-[rgba(41,44,45,0.08)]">
      <div
        className="h-full w-full origin-left rounded-[5px] transition-[scale] duration-700 ease-out"
        style={{ scale: `${value} 1`, backgroundImage: `linear-gradient(90deg, #1a1a1a, ${ACCENT_END[accent]})` }}
      />
    </div>
  );
}

type Variant = "primary" | "secondary" | "muted";
// primary: 검정 / secondary: 이전·중단(연회색) / muted: 다른 기기 연결·비활성 다음(진회색 35%)
const VARIANT: Record<Variant, string> = {
  primary: "bg-ink text-white disabled:bg-[rgba(41,44,45,0.35)]",
  secondary: "bg-[rgba(41,44,45,0.08)] text-ink-sub",
  muted: "bg-[rgba(41,44,45,0.35)] text-white",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`flex h-[46px] items-center justify-center rounded-[14px] px-[20px] text-[15px] leading-[21px] font-semibold transition-[background-color,scale] duration-200 disabled:cursor-default ${VARIANT[variant]} ${className}`}
      {...props}
    />
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="9" height="6" viewBox="0 0 9 6" fill="none" className={`overflow-visible ${className}`} aria-hidden>
      <path d="M0.5 3L3.3 5.5L8.5 0.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 네모 체크박스 20px
export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-[20px] shrink-0 items-center justify-center rounded-[6px] transition-colors duration-200 ${
        checked ? "bg-ink" : "border border-disabled"
      }`}
    >
      {checked && <CheckIcon className="scale-90" />}
    </span>
  );
}

// 동그라미 22px: 완료(검정 + 체크) / 진행 중(돌아가는 고리) / 대기(옅은 고리)
export type StepState = "done" | "active" | "pending";
export function StepIcon({ state, doneColor = "#1a1a1a" }: { state: StepState; doneColor?: string }) {
  if (state === "done")
    return (
      <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full" style={{ background: doneColor }}>
        <CheckIcon />
      </span>
    );
  return (
    <span
      aria-hidden
      data-motion="keep"
      className={`size-[22px] shrink-0 rounded-full border-[1.5px] border-[rgba(26,26,26,0.15)] ${
        state === "active" ? "animate-spin border-t-ink [animation-duration:1.1s]" : ""
      }`}
    />
  );
}

// 진행 단계 목록 (단계 사이 세로 점 3개)
export function StepList({ steps }: { steps: { label: string; state: StepState }[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((s, i) => (
        <li key={i} className="flex flex-col">
          {i > 0 && (
            <span aria-hidden className="my-[15px] flex w-[22px] flex-col items-center gap-[4px]">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-[2px] rounded-full bg-ink-muted" />
              ))}
            </span>
          )}
          <div className="flex h-[22px] items-center gap-[20px]">
            <StepIcon state={s.state} />
            <span
              className={`text-[15px] leading-[21px] transition-colors duration-300 ${
                s.state === "pending" ? "font-semibold text-ink-muted" : "font-bold text-[#292c2d]"
              }`}
            >
              {s.label}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

// 하단 가운데 안내 문구 (화면을 눌러 시작하세요 / N초 후 자동으로 넘어갑니다)
export function BottomHint({ children }: { children: ReactNode }) {
  return (
    <p className="absolute top-[726.5px] left-0 w-full text-center text-[15px] leading-[21px] font-semibold text-[#8c0f49] opacity-50">
      {children}
    </p>
  );
}
