import type { ConnectedCardData } from "../project-detail/Cards";
import type { ProjectColor } from "../projectColors";

// 홈 (Figma "홈 | 브리핑 받기 전" 100:2968)

export const PROJECT_NAME: Record<ProjectColor, string> = {
  pink: "마케팅 공모전",
  orange: "자기소개서",
  blue: "밴드 동아리",
};

// 오늘의 브리핑 카드 묶음: 앞 → 뒤 순서 (Figma: 파랑이 맨 앞, 주황 가운데, 분홍 맨 뒤)
export const BRIEFING_CARDS: ConnectedCardData[] = [
  { art: 5, tone: "blue", tags: ["밴드 동아리", "마케팅 공모전"], title: "방법을 바로 확정하지 않고,\n작게 시도해 차이를 확인했어요", confidence: 77 },
  { art: 15, tone: "orange", tags: ["자기소개서", "밴드 동아리", "마케팅 공..."], title: "막연했던 어려움을 나눠,\n먼저 바꿀 부분을 찾았어요", confidence: 82 },
  { art: 23, tone: "pink", tags: ["마케팅 공모전", "밴드 동아리"], title: "예상과 다른 결과를 살펴,\n다음 시도에 바꿀 점을 찾았어요", confidence: 86 },
];

export type Change = { id: string; project: ProjectColor; kind: string; title: string; desc: string; action: string };

// 주요 변경 사항. "캠페인 타깃" 카드는 Figma 태그가 자기소개서였지만 내용·필터 개수(마케팅 공모전 2, 자기소개서 1)에 맞춰 마케팅 공모전으로
export const CHANGES: Change[] = [
  { id: "rehearsal-time", project: "blue", kind: "합주 일정 변경", title: "다음 합주는\n오후 7시에 시작해요", desc: "기존 오후 6시에서\n한 시간 늦춰졌어요", action: "참석 여부 답하기" },
  { id: "deadline", project: "orange", kind: "접수 일정 변경", title: "지원 마감이\n사흘 미뤄졌어요", desc: "남은 문항과 검토 시간을 반영해\n작성 일정 조정안을 준비했어요", action: "일정 조정안 보기" },
  { id: "target", project: "pink", kind: "타깃 변경", title: "캠페인 타깃이\n대학생으로 좁혀졌어요", desc: "기존 메시지에서\n검토할 부분을 정리했어요", action: "검토 내용 보기" },
  { id: "pages", project: "pink", kind: "제출 분량 변경", title: "제안서를 15장 이내로\n줄여야 해요", desc: "현재 18장인 구성에서\n합칠 수 있는 내용을 정리했어요", action: "축약안 검토하기" },
  { id: "venue", project: "blue", kind: "리허설 장소 변경", title: "리허설 장소가\n학생회관 무대로 바뀌었어요", desc: "새 장소에서 확인할 장비와\n이동 준비를 정리했어요", action: "준비 목록 보기" },
  { id: "show-time", project: "blue", kind: "공연 시간 변경", title: "공연 시간이\n20분으로 줄었어요", desc: "기존 곡 구성에서 5분을 줄일\n조정안을 준비했어요", action: "곡 구성안 보기" },
];

export type Source = "kakao" | "notion" | "calendar" | "drive";

export const SOURCE_NAME: Record<Source, string> = {
  kakao: "카카오톡",
  notion: "노션",
  calendar: "캘린더",
  drive: "Google Drive",
};

// 스테디 히스토리: time이 없으면 진행 중
export type HistoryItem = { source: Source; project: ProjectColor; text: string; time?: string };

export const HISTORY: HistoryItem[] = [
  { source: "kakao", project: "blue", text: "팀 대화방의 새 메시지에서 공연 준비 논의를 확인하고 있어요." },
  { source: "notion", project: "pink", text: "‘공모전 기획’에서 캠페인 수정 내용을 확인하고 있어요." },
  { source: "notion", project: "orange", text: "‘문항별 초안’에서 지원 동기 수정 내용을 확인하고 있어요." },
  { source: "kakao", project: "blue", text: "팀원들이 제안한 공연 후보곡 3곡을 확인했어요.", time: "11:00" },
  { source: "kakao", project: "blue", text: "곡 선정 기준에 관한 팀원들의 의견을 확인했어요.", time: "10:55" },
  { source: "calendar", project: "blue", text: "공동 캘린더에서 합주 시간이 오후 6시에서 7시로 변경된 것을 확인했어요.", time: "10:48" },
  { source: "notion", project: "pink", text: "‘타깃 분석’에서 주 고객층을 대학생으로 좁힌 내용을 확인했어요.", time: "10:42" },
  { source: "drive", project: "pink", text: "‘공모전 제안서’에 경쟁사 비교 내용이 추가된 것을 확인했어요.", time: "10:35" },
  { source: "notion", project: "pink", text: "‘아이디어 비교’에 캠페인 후보별 장단점이 정리된 것을 확인했어요.", time: "10:28" },
  { source: "notion", project: "orange", text: "‘경험 정리’에 공모전 기획 경험이 추가된 것을 확인했어요.", time: "10:20" },
  { source: "drive", project: "orange", text: "‘자기소개서 초안’에서 문제 해결 사례가 수정된 것을 확인했어요.", time: "10:12" },
  { source: "notion", project: "orange", text: "‘지원 준비’에 자기소개서 문항과 제출 일정이 정리된 것을 확인했어요.", time: "10:05" },
];
