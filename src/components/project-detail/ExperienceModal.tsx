"use client";

import Modal from "../Modal";
import { PROJECT_COLORS, type ProjectColor } from "../projectColors";
import type { ExperienceCardData } from "./Cards";
import { THEMES } from "./data";

/*
 * 경험 카드 자세히 보기 (Figma "경험카드" 153:6772 · 보관 후 153:7065)
 * 경험 카드를 누르면 열린다. 위 칩(경험 카드 · 프로젝트), 제목·감지 정보, 스테디가 정리한 경험·내용, 원문 보기,
 * 아래 고정 버튼 보관·메모·삭제. 보관하면 보관 버튼이 50px 아이콘으로 줄고 메모·삭제가 넓어진다.
 * 본문(정리한 경험·내용·원문)은 Figma 시안 문구 하나뿐이라 모든 카드에 같이 보여 준다 (카드별 내용 생기면 교체)
 */

const SAMPLE = {
  date: "10.15(목) 14:00",
  summary: "A구간에서 드럼 소리 때문에 보컬 팀원이 자기 목소리를 듣기 어려워해요.",
  steps: [
    { label: "상황", text: "전략안 3개 (SNS 챌린지·인플루언서 협업·오프라인 팝업) 중 선택 필요" },
    { label: "판단", text: "팀 리소스·실행 가능성 기준으로 SNS 챌린지형 선택" },
    { label: "행동", text: "노션에 전략안 비교 페이지 작성" },
  ],
  origin: { app: "Notion", text: "‘전략안 비교’ - 1. SNS 챌린지형,  2. 인플루언서 협업형, 3. 오프라인 팝업형 …" },
};

// 단계 이름 색: 파랑은 Figma(#027fc7), 분홍·주황은 시안이 없어 같은 밝기로 맞춘 색
const STEP_LABEL: Record<ProjectColor, string> = { blue: "#027fc7", pink: "#d4247f", orange: "#d9560f" };

export default function ExperienceModal({
  card,
  project,
  color,
  archived,
  onArchive,
  onClose,
}: {
  card: ExperienceCardData;
  project: string;
  color: ProjectColor;
  archived: boolean;
  onArchive: () => void;
  onClose: () => void;
}) {
  const c = PROJECT_COLORS[color];
  const dot = THEMES[color].dot;
  const accentText = { backgroundImage: `linear-gradient(90deg, #1a1a1a, ${c.tagText})` };
  // 카드 글은 4줄 → 창에서는 두 줄로 (앞 두 줄 / 나머지)
  const lines = card.text.split("\n");
  const title = `${lines.slice(0, 2).join(" ")}\n${lines.slice(2).join(" ")}`;

  return (
    <Modal label="경험 카드" onClose={onClose}>
      <div className="absolute top-[35px] left-[35px] z-10 flex gap-[10px]">
        <span className="flex h-[33px] items-center rounded-[16px] bg-toggle px-[12px] text-[13px] leading-[16.9px] font-semibold text-ink-sub">
          경험 카드
        </span>
        <span
          className="flex h-[33px] items-center rounded-[16px] px-[12px] text-[13px] leading-[16.9px] font-semibold"
          style={{ background: c.chipBg, color: c.tagText }}
        >
          {project}
        </span>
      </div>

      {/* 본문은 창 위부터 스크롤되고, 칩 근처(56~92px)에서 글자 자체가 투명하게 사라진다 (덮개 띠 없이) */}
      <div className="modal-scroll absolute top-0 right-[12px] bottom-0 left-[35px] overflow-y-auto pt-[83px] [mask-image:linear-gradient(to_bottom,transparent_56px,#000_92px)] pr-[18px] pb-[130px]">
        <div className="flex flex-col gap-[25px]">
          <div className="flex flex-col gap-[5px] px-[6px]">
            <h2 className="text-[22px] leading-[31.9px] font-semibold whitespace-pre-line">{title}</h2>
            <p className="text-[14px] leading-[18.2px] font-semibold text-disabled">
              {SAMPLE.date} · {card.source === "notion" ? "노션" : "카카오톡"} 감지
            </p>
          </div>

          <section className="flex flex-col gap-[12px] px-[6px]">
            <SectionLabel color={color}>스테디가 정리한 경험</SectionLabel>
            <p className="rounded-[16px] px-[18px] py-[14px]" style={{ background: `color-mix(in srgb, ${c.chipBg} 50%, transparent)` }}>
              <span className="bg-clip-text text-[14px] leading-[21px] font-semibold text-transparent" style={accentText}>
                {SAMPLE.summary}
              </span>
            </p>
          </section>

          <section className="flex flex-col gap-[18px] px-[6px]">
            <div className="flex flex-col gap-[12px]">
              <SectionLabel color={color}>스테디가 정리한 내용</SectionLabel>
              <ol className="flex flex-col gap-[16px] px-[2px]">
                {SAMPLE.steps.map((s, i) => (
                  <li key={s.label} className="relative flex gap-[12px]">
                    <span
                      aria-hidden
                      className="flex size-[22px] shrink-0 items-center justify-center rounded-full"
                      style={{ background: `radial-gradient(closest-side, ${dot.ring[0]}, ${dot.ring[1]})` }}
                    >
                      <span className="size-[8px] rounded-full border" style={{ background: dot.inner, borderColor: dot.border }} />
                    </span>
                    {i < SAMPLE.steps.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute top-[29px] left-[10.5px] h-[25px] border-l border-dashed"
                        style={{ borderColor: dot.inner }}
                      />
                    )}
                    <div className="flex flex-col gap-[2px]">
                      <span className="text-[13px] leading-[22px] font-semibold" style={{ color: STEP_LABEL[color] }}>
                        {s.label}
                      </span>
                      <span className="w-fit bg-clip-text text-[14px] leading-[21px] font-semibold text-transparent" style={accentText}>
                        {s.text}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-center gap-[15px] rounded-[16px] bg-[rgba(26,26,26,0.03)] px-[18px] py-[14px] text-[14px] leading-[21px]">
              <span className="shrink-0 font-semibold">원문 보기</span>
              <span className="min-w-0 flex-1 truncate text-[#47484c]">
                {SAMPLE.origin.app} {SAMPLE.origin.text}
              </span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="shrink-0" aria-hidden>
                <path d="M1 1L5 5L9 1" stroke="#B9BBC0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </section>
        </div>
      </div>

      {/* 아래 120px 흰 페이드 위에 버튼 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-linear-to-t from-white from-65% to-white/0" />
      <div className="absolute right-[30px] bottom-[30px] left-[30px] flex gap-[15px]">
        <button
          type="button"
          aria-pressed={archived}
          aria-label={archived ? "보관 취소" : "보관"}
          onClick={onArchive}
          className={`flex h-[50px] shrink-0 items-center justify-center gap-[10px] overflow-hidden rounded-[16px] bg-ink text-[16px] font-semibold text-white transition-[width,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-100 ${
            archived ? "w-[50px]" : "w-[470px]"
          }`}
        >
          <svg width="14" height="17" viewBox="0 0 14 17" fill="none" className="shrink-0" aria-hidden>
            <path
              d="M0.6 2.2C0.6 1.32 1.32 0.6 2.2 0.6H11C11.89 0.6 12.6 1.32 12.6 2.2V14.39C12.6 15.36 11.51 15.94 10.72 15.38L6.6 12.52L2.48 15.38C1.69 15.94 0.6 15.36 0.6 14.39V2.2Z"
              stroke="white"
              strokeWidth="1.2"
              strokeLinejoin="round"
              fill={archived ? "white" : "none"}
            />
          </svg>
          {!archived && <span className="whitespace-nowrap">보관</span>}
        </button>
        <button
          type="button"
          className="flex h-[50px] flex-1 items-center justify-center gap-[10px] rounded-[16px] border border-ink-muted bg-white text-[16px] font-semibold text-[#47484c] hover:scale-100"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              d="M8.6 0.6H5.6C2.84 0.6 0.6 2.84 0.6 5.6V11.6C0.6 14.36 2.84 16.6 5.6 16.6H11.6C14.36 16.6 16.6 14.36 16.6 11.6V8.6"
              stroke="#47484C"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M7.16 10.95L8.89 10.53C9.07 10.49 9.24 10.4 9.37 10.27L15.77 3.86C16.16 3.47 16.16 2.84 15.77 2.45L15.06 1.74C14.67 1.35 14.04 1.35 13.65 1.74L7.24 8.14C7.11 8.27 7.02 8.44 6.98 8.62L6.56 10.35C6.47 10.71 6.8 11.04 7.16 10.95Z"
              stroke="#47484C"
              strokeWidth="1.2"
            />
            <path d="M12.44 2.6L14.74 4.9" stroke="#47484C" strokeWidth="1.2" />
          </svg>
          메모
        </button>
        <button
          type="button"
          className="flex h-[50px] flex-1 items-center justify-center gap-[10px] rounded-[16px] border border-[#ff4a65] bg-white text-[16px] font-semibold text-[#ff4a65] hover:scale-100"
        >
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden>
            <path
              fill="#FF4A65"
              d="M8.78 0c1.53 0 2.84.94 3.37 2.28h3a.6.6 0 0 1 0 1.2h-1.91a3.99 3.99 0 0 1 1.89 3.4V14a4 4 0 0 1-4 4H4.58l-.2-.01A4 4 0 0 1 .58 14V6.88c0-1.44.76-2.7 1.9-3.4H.6a.6.6 0 0 1 0-1.2h2.99C4.12.94 5.43 0 6.96 0h1.82ZM4.58 4.08a2.8 2.8 0 0 0-2.8 2.8V14a2.8 2.8 0 0 0 2.8 2.8h6.55a2.8 2.8 0 0 0 2.8-2.8V6.88a2.8 2.8 0 0 0-2.8-2.8H4.58Zm1 2.75a.6.6 0 0 1 .6.6v6.36a.6.6 0 0 1-1.2 0V7.42a.6.6 0 0 1 .6-.6Zm4.55 0a.6.6 0 0 1 .6.6v6.36a.6.6 0 0 1-1.2 0V7.42a.6.6 0 0 1 .6-.6ZM6.96 1.2c-.84 0-1.58.43-2.02 1.08h5.86A2.43 2.43 0 0 0 8.78 1.2H6.96Z"
            />
          </svg>
          삭제
        </button>
      </div>
    </Modal>
  );
}

// 섹션 이름 + 겹친 유리 마름모 아이콘 (Figma 27×22, 프로젝트 색 빛)
function SectionLabel({ color, children }: { color: ProjectColor; children: string }) {
  const c = PROJECT_COLORS[color];
  const id = `exp-deco-${color}`;
  return (
    <h3 className="flex items-center gap-[8px] text-[13px] leading-[16.9px] font-semibold" style={{ color: c.tagText }}>
      <svg width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden>
        <defs>
          <radialGradient id={id} cx="0.5" cy="0.4" r="0.7">
            <stop stopColor={c.from} />
            <stop offset="1" stopColor={c.to} />
          </radialGradient>
        </defs>
        <path
          d="M2.67 12.88L11.65 7.83C12.82 7.17 14.25 7.17 15.43 7.83L24.4 12.88C25.58 13.54 25.58 15.23 24.4 15.89L15.43 20.94C14.25 21.6 12.82 21.6 11.65 20.94L2.67 15.89C1.5 15.23 1.5 13.54 2.67 12.88Z"
          fill={`url(#${id})`}
          stroke={c.chipBg}
          strokeWidth="0.17"
        />
        <path
          d="M4.41 8.22L11.51 4.28C12.51 3.72 13.72 3.72 14.72 4.28L21.82 8.22C23.01 8.88 23.01 10.58 21.82 11.24L14.72 15.19C13.72 15.74 12.51 15.74 11.51 15.19L4.41 11.24C3.22 10.58 3.22 8.88 4.41 8.22Z"
          fill={`url(#${id})`}
          fillOpacity="0.5"
          stroke={c.chipBg}
          strokeWidth="0.17"
        />
        <path
          d="M7.01 3.56L11.96 0.86C12.94 0.32 14.13 0.32 15.12 0.86L20.07 3.56C21.27 4.22 21.27 5.94 20.07 6.59L15.12 9.29C14.13 9.83 12.94 9.83 11.96 9.29L7.01 6.59C5.81 5.94 5.81 4.22 7.01 3.56Z"
          fill={`url(#${id})`}
          fillOpacity="0.2"
          stroke={c.chipBg}
          strokeWidth="0.17"
        />
      </svg>
      {children}
    </h3>
  );
}
