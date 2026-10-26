import type { ProjectTone } from "../projectColors";
import type { ConnectedCardData, ExperienceCardData } from "./Cards";

export type Step = { label: string; state: "done" | "current" | "todo"; detail?: string; current?: string };

// 화면 강조색 (Figma 프로젝트별): 상태·현재 단계 점, 현재 단계 칸, 목표·인사이트 글자 그라데이션, 경험 카드 색
export type DetailTheme = {
  dot: { ring: [string, string]; inner: string; border: string }; // 상태 칩 점
  currentDot: string; // 현재 단계 점 가운데
  currentBg: string;
  currentLabel: string;
  currentText: string;
  goalEnd: string;
  insightLabel: [string, string];
  insightTitle: [string, string];
  expTone: ProjectTone;
};

export const THEMES: Record<ProjectTone, DetailTheme> = {
  pink: {
    dot: { ring: ["#ff7ac899", "#fef1f91a"], inner: "#ffa1da", border: "#fee5f5" },
    currentDot: "#ff7ac8",
    currentBg: "rgba(255,161,218,0.1)",
    currentLabel: "#ff7ac8",
    currentText: "#8c0f49",
    goalEnd: "#a80c55",
    insightLabel: ["#fa3aa5", "#fa3aa533"],
    insightTitle: ["#560128", "#a80c55"],
    expTone: "pink",
  },
  blue: {
    dot: { ring: ["#3dbeff99", "#eff8ff1a"], inner: "#7dd0fc", border: "#e0f1fe" },
    currentDot: "#44bcf8",
    currentBg: "rgba(120,208,255,0.1)",
    currentLabel: "#44bcf8",
    currentText: "#0c476e",
    goalEnd: "#02578a",
    insightLabel: ["#06a2f1", "#06a2f133"],
    insightTitle: ["#062d4b", "#02578a"],
    expTone: "blue",
  },
  orange: {
    dot: { ring: ["#fe863999", "#fff6ed1a"], inner: "#ffae6b", border: "#ffead4" },
    currentDot: "#fe8639",
    currentBg: "rgba(255,174,107,0.1)",
    currentLabel: "#fe8639",
    currentText: "#7e2610",
    goalEnd: "#9c2b10",
    insightLabel: ["#fc6513", "#fc651333"],
    insightTitle: ["#441006", "#9c2b10"],
    expTone: "orange",
  },
  // 영어 스터디 (Figma 158:18130)
  purple: {
    dot: { ring: ["#9a81ff99", "#f6f1fe1a"], inner: "#beb2ff", border: "#ebe8ff" },
    currentDot: "#9a81ff",
    currentBg: "rgba(190,178,255,0.1)",
    currentLabel: "#9a81ff",
    currentText: "#44189a",
    goalEnd: "#450ca8",
    insightLabel: ["#7f55fd", "#7f55fd33"],
    insightTitle: ["#280c69", "#511abd"],
    expTone: "purple",
  },
};

export type ProjectDetailData = {
  id: string;
  name: string;
  color: ProjectTone;
  theme: DetailTheme;
  status: string;
  goal: string;
  startedAt: string;
  steps: Step[];
  insight: { title: string; desc: string };
  // 경험 모음 처음 화면의 두 묶음 (카드를 겹쳐 쌓은 미리보기)
  bundles: {
    connected: { count: number; createdAgo: string; cards: ConnectedCardData[] };
    experience: { count: number; createdAgo: string; cards: ExperienceCardData[] };
  };
  // 묶음을 눌렀을 때 목록: 연결된 경험 카드(여러 프로젝트에 걸친 경험), 경험 카드(이 프로젝트에서 쌓인 경험)
  connected: ConnectedCardData[];
  experiences: ExperienceCardData[];
};

// 연결된 경험 카드 묶음 미리보기 (두 프로젝트 공통, 뒤 → 앞 순서. 맨 앞 카드만 전용 그림 c9)
const CONNECTED_BUNDLE: ConnectedCardData[] = [
  { art: 2, tone: "pink", title: "따로 준비한 내용을 연결하며,\n전체 흐름을 조정했어요", confidence: 82 },
  { art: 2, tone: "pink", title: "기록에서 구체적인 근거를 찾아\n선택한 이유를 설명했어요", confidence: 82 },
  { art: 1, tone: "orange", title: "여러 방법을 작게 시도하고,\n결과를 비교해 방향을 정했어요", confidence: 82 },
  { art: 4, tone: "pink", title: "피드백에서 바꿀 부분을 찾고,\n다음 시도에 반영했어요", confidence: 82 },
  { art: 8, tone: "orange", title: "한 번에 해결하기 어려운 일을,\n작은 단위로 나눠 진행했어요", confidence: 82 },
  { art: 3, tone: "blue", title: "서로 다른 의견을 모아,\n함께 선택할 기준을 찾았어요", confidence: 82 },
  { art: 6, tone: "pink", title: "계획대로 진행하기 어려울 때,\n가능한 조건부터 다시 살폈어요", confidence: 82 },
  { art: 9, tone: "blue", title: "선택지가 여러 개일 때,\n비교할 기준부터 정했어요", confidence: 82 },
];

// 영어 스터디와 이어진 연결된 경험 카드 (Figma "경험카드 데이터 대체" 158:20125 오른쪽 카드 원본, 그림 c28~c34)
// 같은 카드가 여러 프로젝트 목록에 나온다
const ENGLISH_CONNECTED: Record<string, ConnectedCardData> = {
  feedback: {
    art: 28,
    tone: "purple",
    tags: ["영어 스터디", "자기소개서", "마케팅 공..."],
    title: "피드백에서 부족한 점을 찾아\n내용을 구체적으로 다듬었어요",
    confidence: 90,
  },
  split: {
    art: 29,
    tone: "purple",
    tags: ["영어 스터디", "밴드 동아리", "자기소..."],
    title: "한 번에 해결하기 어려운 일을\n작은 단위로 나눠 진행했어요",
    confidence: 89,
  },
  review: {
    art: 31,
    tone: "orange",
    tags: ["자기소개서", "영어 스터디", "밴드 동..."],
    title: "기록을 되짚어 보며,\n보완할 부분을 찾았어요",
    confidence: 95,
  },
  core: { art: 33, tone: "pink", tags: ["마케팅 공모전", "영어 스터디"], title: "말이 길어질 때\n핵심 한 문장부터 정했어요", confidence: 88 },
  // Figma 태그는 "밴드 동아리"가 두 번 — 보라(영어 스터디) 카드라 첫 태그를 영어 스터디로
  compare: {
    art: 30,
    tone: "purple",
    tags: ["영어 스터디", "밴드 동아리", "마케팅 공..."],
    title: "여러 방법을 시도하고, 결과를\n비교해 방향을 결정했어요",
    confidence: 85,
  },
  small: { art: 34, tone: "blue", tags: ["밴드 동아리", "영어 스터디"], title: "완벽하게 준비하기보다,\n작게 먼저 해보고 맞춰갔어요", confidence: 81 },
  diff: { art: 32, tone: "orange", tags: ["자기소개서", "영어 스터디"], title: "달라진 점을 확인하려고,\n이전 기록과 비교했어요", confidence: 82 },
};

// 영어 스터디 연결된 경험 목록·묶음 (뒤 → 앞)
const ENGLISH_CONNECTED_LIST = [
  ENGLISH_CONNECTED.feedback,
  ENGLISH_CONNECTED.split,
  ENGLISH_CONNECTED.review,
  ENGLISH_CONNECTED.core,
  ENGLISH_CONNECTED.compare,
  ENGLISH_CONNECTED.small,
  ENGLISH_CONNECTED.diff,
];

export const ENGLISH_EXPERIENCES: ExperienceCardData[] = [
  { tag: "영어 스터디", source: "notion", text: "영어로 말할 때 오래 멈추는\n순간을 기록하고,\n어떤 주제에서 더 어려운지\n살펴봤어요" },
  { tag: "영어 스터디", source: "kakao", text: "완벽한 문장을 만들기보다\n짧은 문장으로 먼저 답하는\n연습을 시작했어요" },
  { tag: "영어 스터디", source: "kakao", text: "스터디원이 준 피드백을\n다음 모임에서 해볼 행동으로\n바꿨어요" },
  { tag: "영어 스터디", source: "kakao", text: "자주 쓰고 싶은 표현을\n세 개 골라 실제 대화에서\n사용해봤어요" },
  { tag: "영어 스터디", source: "kakao", text: "준비한 자기 소개뿐 아니라\n즉석 질문에도 한 문장으로\n답해보려 했어요" },
  { tag: "영어 스터디", source: "notion", text: "말하기 연습을 녹음해\n문장을 오래 고민하는 순간과\n자연스럽게 말한 부분을\n확인했어요" },
  { tag: "영어 스터디", source: "notion", text: "연습 후 말한 시간과 대화 참여\n횟수를 기록해 변화를\n비교하고 있어요" },
  { tag: "영어 스터디", source: "notion", text: "익숙한 주제부터 말하는\n시간을 늘리는 방식으로\n목표를 나눴어요" },
];

export const MARKETING_EXPERIENCES: ExperienceCardData[] = [
  {
    tag: "마케팅 공모전",
    text: "공모전의 평가 기준을 읽고\n주제와 제출 요건을 나눠\n기획에서 놓치지 않을\n항목을 정리했어요",
    source: "notion",
  },
  {
    tag: "마케팅 공모전",
    text: "브랜드의 기존 캠페인을 살펴\n반복되는 메시지를 모으고\n이번 기획에서 달리할\n부분을 찾았어요.",
    source: "notion",
  },
  {
    tag: "마케팅 공모전",
    text: "처음에는 1020을 생각했지만\n소비 상황과 관심사를 비교해\n핵심 타깃을 대학생으로\n좁혔어요",
    source: "notion",
  },
  {
    tag: "마케팅 공모전",
    text: "대학생의 이용 후기를 모아\n반복해서 등장하는 불편을 찾고\n캠페인에서 다룰 문제를\n한 문장으로 정리했어요",
    source: "notion",
  },
  {
    tag: "마케팅 공모전",
    text: "처음 세운 타깃이 넓다는\n피드백을 바탕으로 자료를 살펴\n타깃을 나눈 이유와 근거를\n보완했어요",
    source: "notion",
  },
  {
    tag: "마케팅 공모전",
    text: "경쟁 브랜드의 사례를 비교해\n비슷한 접근과 차이를 나누고\n이번 캠페인에서 강조할\n차별점을 정리했어요",
    source: "notion",
  },
  {
    tag: "마케팅 공모전",
    text: "여러 캠페인 방향을 놓고\n타깃 적합성과 실행 가능성을\n비교할 기준으로 삼아\n우선할 방향을 골랐어요",
    source: "notion",
  },
  {
    tag: "마케팅 공모전",
    text: "아이디어를 뒷받침할 자료에서\n주장과 직접 연결되는 근거를\n골라 출처와 함께 정리했어요",
    source: "notion",
  },
  {
    tag: "마케팅 공모전",
    text: "캠페인 메시지 후보를 적고\n타깃의 문제와 연결해 보며\n전달할 핵심 내용을\n한 문장으로 좁혔어요",
    source: "notion",
  },
];

export const BAND_EXPERIENCES: ExperienceCardData[] = [
  {
    tag: "밴드 동아리",
    source: "kakao",
    text: "팀원마다 가능한 시간을 모아\n함께 참여할 수 있는 날을 찾고\n정기 합주 일정을 정했어요",
  },
  {
    tag: "밴드 동아리",
    source: "kakao",
    text: "공연 후보곡을 비교하며\n난이도와 파트 구성을 살피고\n팀원이 함께 연주할\n곡을 골랐어요",
  },
  {
    tag: "밴드 동아리",
    source: "notion",
    text: "곡마다 연습할 구간을 나누고\n파트별 준비 내용을 정리해\n다음 합주 전까지\n맞춰 볼 범위를 정했어요",
  },
  {
    tag: "밴드 동아리",
    source: "kakao",
    text: "팀원의 불참으로 계획을 바꿔\n참여 가능한 인원을 기준으로\n연습할 곡과 순서를\n다시 정했어요",
  },
  {
    tag: "밴드 동아리",
    source: "kakao",
    text: "빠른 구간에서 박자가 어긋나\n팀원들과 속도를 낮춰 맞춘 뒤\n원래 속도로 돌아가\n함께 연주했어요",
  },
  {
    tag: "밴드 동아리",
    source: "notion",
    text: "합주 녹음에서 어긋난 부분을\n곡과 구간별로 표시하고\n다음 연습에서 확인할\n내용을 정리했어요",
  },
  {
    tag: "밴드 동아리",
    source: "notion",
    text: "각 파트가 겹치는 구간을 찾아\n악기별로 소리를 줄여 보며\n보컬이 들리는 음량을\n비교했어요",
  },
  {
    tag: "밴드 동아리",
    source: "kakao",
    text: "곡 사이의 대기 시간을 줄이려\n악기 교체와 시작 신호를 정해\n여러 곡을 이어 연주할\n순서를 맞췄어요",
  },
];

export const RESUME_EXPERIENCES: ExperienceCardData[] = [
  {
    tag: "자기소개서",
    source: "notion",
    text: "채용 공고의 주요 업무와\n지원 자격을 나눠 읽고\n자기소개서에 담을 역량을\n정리했어요",
  },
  {
    tag: "자기소개서",
    source: "notion",
    text: "자기소개서 문항을 나눠\n각 질문이 요구하는 내용을\n경험·행동·결과로 구분해\n작성 기준을 정했어요",
  },
  {
    tag: "자기소개서",
    source: "notion",
    text: "공모전과 동아리 활동에서\n기억에 남는 장면을 모으고\n지원 직무와 관련된 경험을\n추렸어요",
  },
  {
    tag: "자기소개서",
    source: "notion",
    text: "활동 전체의 성과와\n직접 맡았던 역할을 구분해\n내가 한 일을 중심으로\n경험을 다시 정리했어요",
  },
  {
    tag: "자기소개서",
    source: "notion",
    text: "문제 해결 경험을 돌아보며\n당시의 상황과 선택한 행동을\n순서대로 나눠 적고\n결정한 이유를 덧붙였어요",
  },
  {
    tag: "자기소개서",
    source: "notion",
    text: "경험의 결과를 확인하려고\n당시 자료와 기록을 찾아\n설명에 활용할 근거를\n연결했어요",
  },
  {
    tag: "자기소개서",
    source: "notion",
    text: "한 경험이 여러 문항에 겹쳐\n각 문항에서 보여줄 내용을\n비교한 뒤 경험을 나눠\n배치했어요",
  },
  {
    tag: "자기소개서",
    source: "notion",
    text: "성과 위주로 적었던 경험에\n어려움과 해결 과정을 더해\n결과에 이르기까지의 행동을\n구체적으로 정리했어요",
  },
];

export const PROJECT_DETAILS: Record<string, ProjectDetailData> = {
  marketing: {
    id: "marketing",
    name: "마케팅 공모전",
    color: "pink",
    theme: THEMES.pink,
    status: "진행 중",
    goal: "타깃층에 맞는 전략을 수립하고 성과를 도출하기",
    startedAt: "2026.09.01",
    steps: [
      { label: "과제\n파악", state: "done" },
      { label: "타깃\n분석", state: "done" },
      { label: "전략 수립", state: "current", current: "구체화한 타깃을 바탕으로 \n캠페인 방향을 정리하고 있어요" },
      { label: "아이디어\n구체화", state: "todo" },
      { label: "제안서\n작성", state: "todo" },
      { label: "검토 및\n제출", state: "todo" },
    ],
    insight: {
      title: "지금까지 타깃을 구체화하는 과정에서\n가장 많은 의사결정과 피드백이 쌓였어요",
      desc: "처음에는 1020 소비자를 대상으로 생각했지만,\n피드백 이후 타깃을 더 구체적으로 좁혀왔어요",
    },
    bundles: {
      connected: {
        count: 24,
        createdAgo: "2시간 전",
        // 뒤 → 앞 순서. 뒤 카드는 왼쪽 25px만 보여 그림은 색별 빛만 의미 있고, 맨 앞 카드만 전용 그림(c9)
        cards: CONNECTED_BUNDLE,
      },
      experience: { count: 58, createdAgo: "2시간 전", cards: MARKETING_EXPERIENCES.slice(0, 8) },
    },
    // Figma 158:17172: 4번째 카드가 영어 스터디와 이어진 카드로 바뀜 (원래 6번째 같은 제목 카드는 빠짐)
    connected: [
      {
        art: 1,
        tone: "orange",
        tags: ["자기소개서", "마케팅 공모전"],
        title: "전달할 내용을 고를 때,\n상대가 찾는 정보부터 살폈어요",
        confidence: 85,
      },
      {
        art: 2,
        tone: "pink",
        tags: ["마케팅 공모전", "자기소개서", "밴드 동..."],
        title: "선택지가 여러 개일 때,\n비교할 기준을 먼저 정했어요",
        confidence: 92,
      },
      {
        art: 3,
        tone: "blue",
        tags: ["밴드 동아리", "마케팅 공모전"],
        title: "처음 계획이 맞지 않을 때,\n조건을 다시 살펴 조정했어요",
        confidence: 83,
      },
      ENGLISH_CONNECTED.feedback,
      {
        art: 4,
        tone: "pink",
        tags: ["마케팅 공모전", "자기소개서"],
        title: "주장을 구체적으로 설명하려고,\n기록에서 근거를 골랐어요",
        confidence: 91,
      },
      {
        art: 5,
        tone: "blue",
        tags: ["밴드 동아리", "마케팅 공모전"],
        title: "여러 방법을 비교해 보고,\n목적에 맞는 방향을 골랐어요",
        confidence: 81,
      },
      {
        art: 7,
        tone: "blue",
        tags: ["밴드 동아리", "자기소개서", "마케팅 공..."],
        title: "복잡한 내용을 작게 나누고,\n순서를 정해 하나씩 정리했어요",
        confidence: 93,
      },
      {
        art: 8,
        tone: "orange",
        tags: ["자기소개서", "마케팅 공모전"],
        title: "여러 기록을 목적에 맞게 골라,\n하나의 흐름으로 구성했어요",
        confidence: 88,
      },
    ],
    experiences: MARKETING_EXPERIENCES,
  },
  band: {
    id: "band",
    name: "밴드 동아리",
    color: "blue",
    theme: THEMES.blue,
    status: "진행 중",
    goal: "분위기에 맞는 무대를 준비하고, 정한 순서대로 마치기",
    startedAt: "2026.07.14",
    steps: [
      { label: "방향\n설정", state: "done" },
      { label: "곡\n선정", state: "done" },
      { label: "합주 및 편곡", state: "current", current: "곡별 연주를 맞추며\n합주 배치를 조정하고 있어요" },
      { label: "무대\n구성", state: "todo" },
      { label: "무대\n리허설", state: "todo" },
      { label: "공연\n진행", state: "todo" },
    ],
    insight: {
      title: "곡별 연주를 맞추는 데서\n곡 사이의 흐름을 연결하는 논의로 이어지고 있어요",
      desc: "곡 순서와 곡 사이의 대기 시간에 관한 의견이 오갔어요\n다음 합주에서는 여러 곡을 이어 연주해 보자는 제안이 나왔어요",
    },
    bundles: {
      connected: { count: 24, createdAgo: "2시간 전", cards: CONNECTED_BUNDLE },
      // Figma: 묶음 8장 모두 첫 경험 카드
      experience: { count: 58, createdAgo: "2시간 전", cards: Array(8).fill(BAND_EXPERIENCES[0]) },
    },
    connected: [
      {
        art: 2,
        tone: "pink",
        tags: ["마케팅 공모전", "자기소개서", "밴드 동..."],
        title: "선택지가 여러 개일 때,\n비교할 기준을 먼저 정했어요",
        confidence: 91,
      },
      {
        art: 3,
        tone: "blue",
        tags: ["밴드 동아리", "마케팅 공모전"],
        title: "처음 계획이 맞지 않을 때,\n조건을 다시 살펴 조정했어요",
        confidence: 83,
      },
      {
        art: 5,
        tone: "blue",
        tags: ["밴드 동아리", "마케팅 공모전"],
        title: "여러 방법을 비교해 보고,\n목적에 맞는 방향을 골랐어요",
        confidence: 81,
      },
      ENGLISH_CONNECTED.split, // Figma 158:17429에서 추가
      {
        art: 7,
        tone: "blue",
        tags: ["밴드 동아리", "자기소개서", "마케팅 공..."],
        title: "복잡한 내용을 작게 나누고,\n순서를 정해 하나씩 정리했어요",
        confidence: 93,
      },
      {
        art: 3,
        tone: "blue",
        tags: ["밴드 동아리", "마케팅 공모전"],
        title: "피드백에서 바꿀 부분을 찾아,\n다음 시도에 반영했어요",
        confidence: 93,
      },
      {
        art: 10,
        tone: "blue",
        tags: ["밴드 동아리", "자기소개서"],
        title: "기록을 되짚어 보며,\n보완할 부분을 찾았어요",
        confidence: 95,
      },
      {
        art: 11,
        tone: "orange",
        tags: ["자기소개서", "밴드 동아리"],
        title: "따로 준비한 내용을 연결해,\n흐름이 이어지도록 다듬었어요",
        confidence: 88,
      },
    ],
    experiences: BAND_EXPERIENCES,
  },
  resume: {
    id: "resume",
    name: "자기소개서",
    color: "orange",
    theme: THEMES.orange,
    status: "진행 중",
    goal: "직무에 맞는 경험을 정리하고, 문항별 답변 완성하기",
    startedAt: "2026.08.22",
    steps: [
      { label: "요건\n확인", state: "done" },
      { label: "문항\n분석", state: "done" },
      { label: "경험 정리", state: "current", current: "문항에 맞는 경험을 고르고\n행동과 결과를 정리하고 있어요" },
      { label: "초안\n작성", state: "todo" },
      { label: "검토 및\n수정", state: "todo" },
      { label: "최종\n제출", state: "todo" },
    ],
    insight: {
      title: "활동을 나열하는 데서\n행동을 구체화하는 과정으로 이어지고 있어요",
      desc: "노션 ‘경험 정리’에서 활동별 역할과 행동을 구분했어요\n결과를 뒷받침할 자료도 경험별로 연결하고 있어요",
    },
    bundles: {
      connected: { count: 24, createdAgo: "2시간 전", cards: CONNECTED_BUNDLE },
      experience: { count: 58, createdAgo: "2시간 전", cards: RESUME_EXPERIENCES.slice(0, 8) },
    },
    connected: [
      {
        art: 1,
        tone: "orange",
        tags: ["자기소개서", "마케팅 공모전"],
        title: "전달할 내용을 고를 때,\n상대가 찾는 정보부터 살폈어요",
        confidence: 85,
      },
      {
        art: 2,
        tone: "pink",
        tags: ["마케팅 공모전", "자기소개서", "밴드 동..."],
        title: "선택지가 여러 개일 때,\n비교할 기준을 먼저 정했어요",
        confidence: 92,
      },
      {
        art: 4,
        tone: "pink",
        tags: ["마케팅 공모전", "자기소개서"],
        title: "주장을 구체적으로 설명하려고,\n기록에서 근거를 골랐어요",
        confidence: 91,
      },
      {
        art: 6,
        tone: "pink",
        tags: ["마케팅 공모전", "자기소개서"],
        title: "피드백에서 부족한 점을 찾아,\n내용을 구체적으로 다듬었어요",
        confidence: 96,
      },
      {
        art: 7,
        tone: "blue",
        tags: ["밴드 동아리", "자기소개서", "마케팅 공..."],
        title: "복잡한 내용을 작게 나누고,\n순서를 정해 하나씩 정리했어요",
        confidence: 93,
      },
      {
        art: 8,
        tone: "orange",
        tags: ["자기소개서", "마케팅 공모전"],
        title: "여러 기록을 목적에 맞게 골라,\n하나의 흐름으로 구성했어요",
        confidence: 88,
      },
      {
        art: 12,
        tone: "blue",
        tags: ["밴드 동아리", "자기소개서"],
        title: "기록을 되짚어 보며,\n보완할 부분을 찾았어요",
        confidence: 82,
      },
    ],
    experiences: RESUME_EXPERIENCES,
  },
  // Figma 158:18130(묶음) · 158:17928(경험 카드) · 158:18446(연결된 경험 카드)
  english: {
    id: "english",
    name: "영어 스터디",
    color: "purple",
    theme: THEMES.purple,
    status: "진행 중",
    goal: "피드백을 반영해 익숙한 주제는 자신있게 말하기",
    startedAt: "2026.09.15",
    steps: [
      { label: "습관\n살펴보기", state: "done" },
      { label: "짧게 말하기", state: "current", current: "짧은 문장으로 먼저 답하고\n이유를 덧붙이는 연습을 하고 있어요" },
      { label: "1분\n말하기", state: "todo" },
      { label: "피드백\n반영하기", state: "todo" },
      { label: "2분\n말하기", state: "todo" },
    ],
    insight: {
      title: "영어 실력 전체를 한 번에 바꾸기보다,\n대화에 먼저 참여하는 연습부터 시작하고 있어요",
      // Figma의 "스테디 피드배을"은 오타로 보고 "피드백을"로
      desc: "처음에는 문장을 완성한 뒤 말하려고 했지만, 최근에는 짧게 먼저 답하고\n이유를 덧붙이는 방법을 시도하고 있어요. 스테디 피드백을 다음 연습\n목표로 바꿔가며 말하기를 이어가는 중이에요.",
    },
    bundles: {
      connected: { count: 24, createdAgo: "2시간 전", cards: ENGLISH_CONNECTED_LIST },
      experience: { count: 8, createdAgo: "2시간 전", cards: ENGLISH_EXPERIENCES },
    },
    connected: ENGLISH_CONNECTED_LIST,
    experiences: ENGLISH_EXPERIENCES,
  },
};
