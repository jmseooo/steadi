import type { ProjectTone } from "@/components/projectColors";

/*
 * Steadi MVP 데이터 형식 — 화면·DB·AI가 같이 쓰는 기준.
 *
 * 1. 화면이 읽는 형태: 지금 화면의 가짜 데이터(home/data.ts, project-detail/data.ts, growth/stories.ts,
 *    ConnectionHome, Notifications …) 모양을 모은 것. 화면 쪽 타입은 바꾸지 않고, 데이터 함수가 이 형태를 화면 타입으로 바꿔 준다.
 * 2. AI 응답: Gemini가 새벽 배치·온보딩에서 돌려주는 JSON. id·색·날짜처럼 AI가 정하면 안 되는 값은 빼고,
 *    근거가 된 원본 기록은 recordIds로 가리킨다.
 *
 * 화면 글자의 줄바꿈("\n")은 Figma 줄 모양 그대로다. AI 응답 글자에도 Figma처럼 줄을 나눠 넣게 한다 (아래 LINES 참고).
 * 날짜·시간은 모두 ISO 문자열(UTC)로 저장하고, "2시간 전"·"10.27(화)" 같은 표시는 화면에서 만든다.
 */

// ─── 공통 ───────────────────────────────────────────────

/** 기록을 가져오는 곳. 화면 아이콘·이름은 SOURCE_NAME */
export type SourceApp = "kakao" | "notion" | "ai-chat" | "photo" | "calendar" | "drive" | "slack" | "github" | "figma" | "discord" | "manual";

export const SOURCE_NAME: Record<SourceApp, string> = {
  kakao: "카카오톡",
  notion: "노션",
  "ai-chat": "AI 대화",
  photo: "사진",
  calendar: "캘린더",
  drive: "Google Drive",
  slack: "Slack",
  github: "GitHub",
  figma: "Figma",
  discord: "Discord",
  manual: "직접 입력",
};

/** 성장의 순간 카테고리 (미리 정해 두고 AI는 이 중에서 고른다 — 문서 04 Growth) */
export const MOMENT_CATEGORIES = ["problem-solving", "decision-making", "adaptation", "analysis", "planning"] as const;
export type MomentCategory = (typeof MOMENT_CATEGORIES)[number];

/** 원본 기록 하나 (카톡 한 메시지 묶음, 노션 한 블록 묶음 …). 수집 담당이 저장하고 AI는 읽기만 한다 */
export type RawRecord = {
  id: string;
  source: SourceApp;
  sourceTitle: string; // 대화방·페이지 이름 ("밴드 동아리", "공모전 기획")
  url?: string; // 노션 페이지 등 원본 링크 (카톡은 없음)
  author?: string; // 단톡방에서 말한 사람
  text: string;
  at: string;
  projectId?: string; // AI가 프로젝트로 묶은 뒤 채워진다
};

// ─── 1. 화면이 읽는 형태 ─────────────────────────────────

/** 프로젝트 (ProjectHome 폴더 + ProjectDetail) */
export type Project = {
  id: string;
  name: string;
  color: ProjectTone; // 사용자마다 프로젝트 순서대로 pink → orange → blue → purple
  status: "진행 중" | "종료";
  goal: string;
  startedAt: string;
  steps: ProjectStep[]; // 타임라인. AI가 제안하고 사용자가 고칠 수 있다
  insight: { title: string; desc: string }; // "스테디가 보고 있는 지금"
  sources: { app: SourceApp; title: string }[]; // 이 프로젝트를 찾은 곳 (온보딩 "노션 ‘공모전 기획’")
};

export type ProjectStep = { label: string; state: "done" | "current" | "todo"; current?: string };

/** 경험 카드: 한 프로젝트 안에서 쌓인 행동 하나 (project-detail ExperienceCardData + ExperienceModal) */
export type ExperienceCard = {
  id: string;
  projectId: string;
  text: string; // 카드 문장, 4줄 이내
  source: SourceApp;
  at: string; // 감지한 시각
  summary: string; // 자세히 보기 "스테디가 정리한 경험"
  steps: { label: "상황" | "판단" | "행동"; text: string }[];
  origin: { app: SourceApp; title: string; text: string; url?: string; recordIds: string[] }; // 원문 보기
  archived?: boolean;
  memo?: string;
};

/** 연결된 경험 카드: 여러 프로젝트에 걸쳐 반복된 행동 패턴 + 자세히 보기 이야기 (ConnectedCardData + growth Story) */
export type ConnectedCard = {
  id: string;
  title: string; // 두 줄
  tone: ProjectTone; // 맨 앞 프로젝트 색
  art: number; // 카드 그림 번호 (public/assets/cards/c{art})
  projectIds: string[]; // 태그. 화면에서 프로젝트 이름으로 바꾸고 길면 줄인다
  evidenceCount: number; // "근거 기록 N개" ("83% 확신" 대신)
  category: MomentCategory;
  createdAt: string;
  story: {
    discovery: string;
    experienceIds: string[]; // 2~3장, 뒤 → 앞
    common: string[]; // 공통점 2~3개
    pattern: { lead?: string; highlight: string; note: string };
    save: string;
  };
  savedAsMoment?: boolean; // "성장의 순간으로 저장"
};

/** 제안 카드 (growth SuggestionCards): 연결된 경험을 지금 프로젝트에 써 보자는 제안. 색은 프로젝트 색에서 정한다 */
export type Suggestion = {
  id: string;
  connectedId: string;
  projectId: string;
  stage: string; // 라벨 "밴드 동아리 · 합주 및 편곡"의 뒤쪽 (지금 타임라인 단계)
  title: string;
  desc: string;
  candidates: string; // "박자 맞추기 · 음량 조정 · 곡 연결"
  criteria: string; // "합주에 미치는 영향 · 필요한 연습 시간"
  action: string; // "연습 우선순위표 초안 만들기"
};

/** 홈 주요 변경 사항 (home Change) */
export type Change = { id: string; projectId: string; kind: string; title: string; desc: string; action: string; at: string };

/** 스테디 히스토리 (home HistoryItem). 실시간 "확인하고 있어요"는 없애고 끝난 작업 기록만 남긴다 */
export type HistoryItem = { id: string; source: SourceApp; projectId: string; text: string; at: string };

/** 커넥션 피드백 (ConnectionHome Feedback + FeedbackDetail) */
export type Feedback = {
  id: string;
  projectId: string;
  type: string; // "자리이동 요청"
  source: SourceApp;
  line: string; // 목록 한 줄 설명
  at: string;
  title: string;
  meta: string; // "노션 ‘합주 피드백’"
  original: string; // 원문
  summary: { label: string; text: string }[];
  suggestion: { title: string; desc: string; action: string; columns: { label: string; text: string }[] };
  recordIds: string[];
};

/** 알림 (Notifications Noti) */
export type Notification = {
  id: string;
  tab: "스테디" | "프로젝트" | "시스템";
  source: string[]; // [앱 이름, 세부, …]
  title: string;
  desc: string;
  at: string;
  read: boolean;
  href?: string;
};

// ─── 2. AI 응답 (Gemini JSON) ───────────────────────────

/** 화면 줄 수 제한. 프롬프트에 그대로 쓴다 */
export const LINES = { connectedTitle: 2, experienceText: 4, suggestionTitle: 2, changeTitle: 2 } as const;

/** 온보딩: 가져온 기록을 프로젝트로 묶기 (실시간 1~3번) */
export type AiProjectGrouping = {
  projects: { name: string; intro: string; goal: string; recordIds: string[] }[];
};

/** 온보딩 목표 대화 한 턴 */
export type AiGoalTurn = { ask: string } | { reflected: string; goal: string };

/** 새벽 배치: 프로젝트 하나의 새 기록 → 경험 카드·피드백·변경 사항·타임라인 */
export type AiProjectDigest = {
  experiences: (Omit<ExperienceCard, "id" | "projectId" | "at" | "origin" | "archived" | "memo"> & { recordIds: string[] })[];
  feedbacks: (Omit<Feedback, "id" | "projectId" | "at">)[];
  changes: Omit<Change, "id" | "projectId" | "at">[];
  steps: ProjectStep[];
  insight: Project["insight"];
};

/** 새벽 배치: 비슷한 경험 카드 묶음(임베딩으로 찾음) → 연결된 경험 + 제안 */
export type AiConnection = {
  title: string;
  category: MomentCategory;
  story: Omit<ConnectedCard["story"], "experienceIds">;
  suggestions: Omit<Suggestion, "id" | "connectedId">[];
};
