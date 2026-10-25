"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import FeedbackCalendar, { dateKey } from "./FeedbackCalendar";
import FeedbackDetail, { type FeedbackDetailData } from "./FeedbackDetail";
import FilterChips from "./FilterChips";
import { toneColors, type ProjectTone } from "./projectColors";

const PROJECTS: Record<string, ProjectTone> = {
  "마케팅 공모전": "pink",
  자기소개서: "orange",
  "밴드 동아리": "blue",
  "영어 스터디": "purple",
};
type ProjectName = keyof typeof PROJECTS;

const FILTERS = ["전체", ...Object.keys(PROJECTS)] as const;

type Feedback = { id: number; type: string; source: string; project: ProjectName; text: string; date: string; day: string };

const FEEDBACKS: Feedback[] = [
  { id: 1, type: "자리이동 요청", source: "카카오톡", project: "밴드 동아리", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)", day: "2026-10-27" },
  { id: 2, type: "자리이동 요청", source: "카카오톡", project: "마케팅 공모전", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)", day: "2026-10-27" },
  { id: 3, type: "자리이동 요청", source: "카카오톡", project: "마케팅 공모전", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)", day: "2026-10-27" },
  { id: 4, type: "자리이동 요청", source: "카카오톡", project: "자기소개서", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)", day: "2026-10-27" },
  { id: 5, type: "자리이동 요청", source: "카카오톡", project: "밴드 동아리", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)", day: "2026-10-27" },
];

// 날짜별 피드백이 있는 프로젝트 점 (Figma 2026년 10월 달력 기준, 보라 = 영어 스터디)
const P = "pink", O = "orange", B = "blue", V = "purple";
const DOTS: Record<string, ProjectTone[]> = {
  "2026-9-27": [P, B], "2026-9-28": [P, O], "2026-9-29": [B, V], "2026-9-30": [B],
  "2026-10-1": [O, B], "2026-10-2": [P, B], "2026-10-3": [P, O],
  "2026-10-4": [P, B], "2026-10-5": [P, B], "2026-10-6": [P, B], "2026-10-8": [V], "2026-10-9": [P, O], "2026-10-10": [P, B],
  "2026-10-11": [P, B], "2026-10-12": [P, B], "2026-10-13": [V], "2026-10-14": [O, B], "2026-10-15": [P, B], "2026-10-16": [P], "2026-10-17": [P, B],
  "2026-10-18": [O, B], "2026-10-19": [P, B], "2026-10-20": [O, B, V], "2026-10-21": [P, B], "2026-10-23": [P, B], "2026-10-24": [P, B],
  "2026-10-25": [P, B], "2026-10-26": [P, B], "2026-10-27": [P, O, B],
};

// 상세 내용 목업 (Figma "커넥션 | 내용 클릭시") — 프로젝트 칩만 누른 피드백 기준으로 바꿔 쓴다
const DETAIL: Omit<FeedbackDetailData, "project" | "color"> = {
  title: "보컬 모니터링을 위한 자리 변경 요청",
  meta: "10.27(화) 18:00 · 노션 ‘합주 피드백’",
  original:
    "“합주할 때 제가 A구간에 있으니까 드럼 소리가 너무 커서 제 목소리 모니터가 잘 안 돼요. 다음 연습부터는 C구간 쪽으로 옮겨서 해도 될까요? 앰프랑도 조금 떨어져 있으면 좋겠어요.”",
  summary: [
    { label: "현재 어려움", text: "A구간에서 드럼 소리 때문에 보컬 팀원이 자기 목소리를 듣기 어려워해요." },
    { label: "요청한 변화", text: "다음 합주부터 C구간으로 이동하고, 앰프와의 거리를 확보하고 싶다는 요청이에요." },
    { label: "확인이 필요한 부분", text: "위치와 앰프 거리를 조정했을 때 자기 목소리가 더 잘 들리는지 확인이 필요해요." },
  ],
  suggestion: {
    title: "보컬 팀원이 자기 목소리를 들을 수 있도록 배치를 조정해 볼까요?",
    desc: "스테디가 배치 테스트 계획을 초안으로 만들어요. 검토한 뒤 프로젝트에 추가할 수 있어요.",
    action: "배치 테스트 계획 만들기",
    columns: [
      { label: "테스트해 볼 내용", text: "- 보컬 팀원과 앰프 사이의 거리 조정\n- 팀원이 요청한 C구간을 포함해 배치 후보 비교" },
      { label: "확인 기준", text: "- 보컬 팀원이 자기 목소리를 이전보다 잘 들을 수 있는지" },
    ],
  },
};

// 목업 기준 오늘 날짜
const TODAY = new Date(2026, 9, 27);

export default function ConnectionHome() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [selected, setSelected] = useState(TODAY);
  const [opened, setOpened] = useState<Feedback | null>(null);
  const close = useCallback(() => setOpened(null), []);
  // 선택한 날짜 + 프로젝트 필터에 맞는 피드백만
  const feedbacks = FEEDBACKS.filter(
    (f) => f.day === dateKey(selected) && (filter === "전체" || f.project === filter),
  );
  // 프로젝트를 고르면 달력 점도 그 프로젝트 색만 남긴다 (Figma "커넥션 | 홈 (프로젝트 선택 시)")
  const dots =
    filter === "전체"
      ? DOTS
      : Object.fromEntries(
          Object.entries(DOTS).map(([day, colors]) => [day, colors.filter((c) => c === PROJECTS[filter])]),
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
          <FilterChips items={FILTERS} value={filter} onChange={setFilter} />
        </div>

        <div className="flex gap-[20px] max-lg:flex-col max-lg:items-center">
          <FeedbackCalendar dots={dots} today={TODAY} selected={selected} onSelect={setSelected} />

          {feedbacks.length > 0 ? (
            <ul className="flex min-w-0 flex-1 flex-col gap-[12px] max-lg:w-full">
              {feedbacks.map((f) => (
                <li key={f.id}>
                  <FeedbackItem feedback={f} onOpen={() => setOpened(f)} />
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
              data={{ ...DETAIL, project: opened.project, color: PROJECTS[opened.project] }}
              onClose={close}
            />
          </div>
        </>
      )}
      </div>
    </main>
  );
}

function FeedbackItem({ feedback: f, onOpen }: { feedback: Feedback; onOpen: () => void }) {
  const c = toneColors(PROJECTS[f.project]);

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
