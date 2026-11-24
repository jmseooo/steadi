import type { FeedbackDetailData } from "./FeedbackDetail";
import type { ProjectTone } from "./projectColors";

// 커넥션(내 피드백) 화면의 가짜 데이터. 화면은 lib/data의 getConnectionData로 받는다
export type ConnectionData = {
  projects: Record<string, ProjectTone>;
  feedbacks: Feedback[];
  dots: Record<string, ProjectTone[]>; // 날짜별 피드백이 있는 프로젝트 점
  detail: Omit<FeedbackDetailData, "project" | "color">;
};

// 커넥션 프로젝트 이름 → 색
export const PROJECTS: Record<string, ProjectTone> = {
  "마케팅 공모전": "pink",
  자기소개서: "orange",
  "밴드 동아리": "blue",
  "영어 스터디": "purple",
};
export type Feedback = { id: number; type: string; source: string; project: string; text: string; date: string; day: string };

export const FEEDBACKS: Feedback[] = [
  { id: 1, type: "자리이동 요청", source: "카카오톡", project: "밴드 동아리", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)", day: "2026-10-27" },
  { id: 2, type: "자리이동 요청", source: "카카오톡", project: "마케팅 공모전", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)", day: "2026-10-27" },
  { id: 3, type: "자리이동 요청", source: "카카오톡", project: "마케팅 공모전", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)", day: "2026-10-27" },
  { id: 4, type: "자리이동 요청", source: "카카오톡", project: "자기소개서", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)", day: "2026-10-27" },
  { id: 5, type: "자리이동 요청", source: "카카오톡", project: "밴드 동아리", text: "밴드 연습 중에 원래 자리였던 A구간에서 C구간으로 이동할 것을 팀원이 요청했어요.", date: "26.10.27 (화)", day: "2026-10-27" },
];

// 날짜별 피드백이 있는 프로젝트 점 (Figma 2026년 10월 달력 기준, 보라 = 영어 스터디)
const P = "pink", O = "orange", B = "blue", V = "purple";
export const DOTS: Record<string, ProjectTone[]> = {
  "2026-9-27": [P, B], "2026-9-28": [P, O], "2026-9-29": [B, V], "2026-9-30": [B],
  "2026-10-1": [O, B], "2026-10-2": [P, B], "2026-10-3": [P, O],
  "2026-10-4": [P, B], "2026-10-5": [P, B], "2026-10-6": [P, B], "2026-10-8": [V], "2026-10-9": [P, O], "2026-10-10": [P, B],
  "2026-10-11": [P, B], "2026-10-12": [P, B], "2026-10-13": [V], "2026-10-14": [O, B], "2026-10-15": [P, B], "2026-10-16": [P], "2026-10-17": [P, B],
  "2026-10-18": [O, B], "2026-10-19": [P, B], "2026-10-20": [O, B, V], "2026-10-21": [P, B], "2026-10-23": [P, B], "2026-10-24": [P, B],
  "2026-10-25": [P, B], "2026-10-26": [P, B], "2026-10-27": [P, O, B],
};

// 상세 내용 목업 (Figma "커넥션 | 내용 클릭시") — 프로젝트 칩만 누른 피드백 기준으로 바꿔 쓴다
export const DETAIL: Omit<FeedbackDetailData, "project" | "color"> = {
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
