import type { ProjectTone } from "../projectColors";

export const METHODS = [
  { id: "device", title: "기기에서 서비스 찾기", desc: "연결한 기기에서 사용하는 서비스를 찾아요." },
  { id: "ai", title: "AI 대화 파일 가져오기", desc: "대화 기록에서 프로젝트 내용을 찾아요." },
  { id: "manual", title: "직접 프로젝트 만들기", desc: "프로젝트 이름과 목표를 적어 주세요." },
] as const;

export const SERVICES = [
  { id: "notion", name: "Notion", short: "노션", icon: "/assets/onboarding/svc-notion.png" },
  { id: "slack", name: "Slack", short: "슬랙", icon: "/assets/onboarding/svc-slack.png" },
  { id: "drive", name: "Google Drive", short: "구글 드라이브", icon: "/assets/onboarding/svc-drive.png" },
  { id: "photos", name: "사진", short: "사진", icon: "/assets/onboarding/svc-photos.png" },
  { id: "calendar", name: "캘린더", short: "캘린더", icon: "/assets/onboarding/svc-calendar.png" },
  { id: "kakao", name: "카카오톡", short: "카카오톡", icon: "/assets/onboarding/svc-kakao.png" },
] as const;
export type ServiceId = (typeof SERVICES)[number]["id"];

// 단계별 진행 화면 문구 (Figma 기기 연결 1~3 / 프로젝트 찾기 1~3)
export const DEVICE_PROGRESS = {
  titles: [
    "이 기기를 연결하고 있어요",
    "사용하는 서비스를 확인 중이예요",
    "연결 가능한 서비스를 정리 중이예요",
    "이 기기에서 서비스를 찾았어요",
  ],
  desc: "연결이 끝나면 연결 가능한 서비스를 보여드려요.",
  steps: [
    { pending: "기기 연결", active: "기기 연결 중", done: "기기 연결 완료!" },
    { pending: "사용 서비스 확인", active: "사용 서비스 확인 중", done: "사용 서비스 확인 완료!" },
    { pending: "연결 가능한 서비스 정리", active: "연결 가능한 서비스 정리 중", done: "서비스 목록 준비 완료!" },
  ],
};

export const FIND_PROGRESS = {
  titles: [
    "선택한 기록에서 프로젝트를 찾고 있어요",
    "선택한 기록에서 프로젝트를 찾고 있어요",
    "선택한 기록에서 프로젝트를 찾고 있어요",
    "선택한 기록에서 프로젝트를 찾았어요",
  ],
  steps: [
    { pending: "선택한 서비스 연결", active: "선택한 서비스 연결 중", done: "선택한 서비스 연결 완료!" },
    { pending: "프로젝트 관련 기록 확인", active: "프로젝트 관련 기록 확인 중", done: "프로젝트 관련 기록 확인 완료!" },
    { pending: "같은 프로젝트의 기록 정리", active: "같은 프로젝트의 기록 정리 중", done: "같은 프로젝트의 기록 정리 완료!" },
  ],
};

export type FoundProject = {
  id: string;
  name: string;
  source: string;
  folder?: string; // 폴더에 쓰는 이름 (Figma: 영어스터디는 붙여 씀)
  color?: ProjectTone; // 목표 확인 화면이 있는 프로젝트만 색이 있다
  intro?: string;
  goal?: string;
};

export const FOUND_PROJECTS: FoundProject[] = [
  {
    id: "marketing",
    name: "마케팅 공모전",
    source: "노션 ‘공모전 기획’",
    color: "pink",
    intro: "노션 ‘공모전 기획’에서 타깃 분석과 캠페인 제안에 관한 내용을 확인했어요.",
    goal: "타깃 분석을 바탕으로 브랜드 캠페인을 기획하고, 공모전 제안서를 완성해 제출하기",
  },
  {
    id: "band",
    name: "밴드 동아리",
    source: "카카오톡 ‘밴드 동아리’",
    color: "blue",
    intro: "카카오톡 ‘밴드 동아리’의 기록에서 공연 기획과 준비에 관련한 논의를 발견했어요.",
    goal: "공연을 기획하고, 곡 선정부터 합주·무대 준비와 공연 진행까지 마무리하기",
  },
  {
    id: "resume",
    name: "자기소개서",
    source: "노션 ‘경험 정리 및 자기...’",
    color: "orange",
    intro: "노션 ‘경험 정리 및 자기소개서’에서 지원 직무와 문항별 초안을 확인했어요.",
    goal: "지원 직무에 맞는 경험을 정리하고, 문항별 자기소개서를 완성해 제출하기",
  },
  {
    id: "english",
    name: "영어 스터디",
    folder: "영어스터디",
    source: "카카오톡 ‘영어 스터디’",
    color: "purple",
    intro: "카카오톡 ‘영어 스터디’의 기록에서 영어 말하기 연습과 피드백에 관한 대화를 발견했어요.",
    goal: "영어스터디에 꾸준히 참여하고, 영어 말하기 실력 키우기",
  },
];

// 목표 확인 순서: 마케팅 공모전 → 자기소개서 → 밴드 동아리 → 영어 스터디 (Figma 흐름)
export const GOAL_ORDER = ["marketing", "resume", "band", "english"];

// 목표 대화에서 스테디가 되묻는 말 (밴드 동아리·영어 스터디는 Figma 대화 그대로)
export const FOLLOW_UP: Record<string, { ask: string; reflected: string; goal: string }> = {
  band: {
    ask: "기획한 방향을 목표에 반영하려고 해요.\n공연에서 꼭 구현하고 싶은 부분은 무엇인가요?",
    reflected: "곡의 분위기에 맞는 무대 구성과 공연 진행 순서를 목표에 반영했어요.",
    goal: "곡의 분위기에 맞는 무대를 준비하고, 정한 순서대로 공연을 마치기",
  },
  english: {
    ask: "대화에 참여하는 경험을 목표에 반영하려고 해요.\n영어로 말할 때 특히 달라지고 싶은 부분은 무엇인가요?",
    reflected: "매주 말해보는 연습과 스터디원 피드백을 반영하는 과정을 목표에 담았어요.",
    goal: "매주 영어로 말해보고, 피드백을 반영해 익숙한 주제는 자신 있게 말하기",
  },
};
