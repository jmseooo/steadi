import type { ProjectTone } from "../projectColors";
import type { ConnectedCardData, ExperienceCardData } from "../project-detail/Cards";
import {
  BAND_EXPERIENCES as BAND,
  ENGLISH_EXPERIENCES as ENGLISH,
  MARKETING_EXPERIENCES as MARKETING,
  RESUME_EXPERIENCES as RESUME,
} from "../project-detail/data";

// 성장 > 연결된 경험 자세히 보기 이야기 데이터.
// 기본 이야기(/growth/connected) + Figma "성장"(181:1226) 스크린샷의 이야기 5개(/growth/connected/[slug])
export type StoryEntry = { card: ExperienceCardData; tone: ProjectTone };
export type Story = {
  title: string; // 경로에 쓰는 한 줄 제목
  discovery: string; // "새로운 연결을 발견했어요" 아래 설명 (두 줄)
  cards: StoryEntry[]; // 2~3장, 뒤 → 앞 순서
  connected: ConnectedCardData;
  common: string[]; // 공통점
  pattern: { lead?: string; highlight: string; note: string }; // "서로 다른 상황에서도 반복적으로 나타난 것은" 다음 줄, 아래 회색 설명 첫 줄
  save: string; // 저장 안내 가운데 줄
};

const m = (card: ExperienceCardData): StoryEntry => ({ card, tone: "pink" });
const r = (card: ExperienceCardData): StoryEntry => ({ card, tone: "orange" });
const b = (card: ExperienceCardData): StoryEntry => ({ card, tone: "blue" });
const e = (card: ExperienceCardData): StoryEntry => ({ card, tone: "purple" });

const discovery = (projects: string[]) =>
  `프로젝트를 분석하는 과정에서, 이전에는 서로 다른 경험으로 남아 있던\n${projects.join(" · ")}의 기록이 하나의 패턴으로 이어질 가능성을 발견했습니다`;

export const DEFAULT_STORY: Story = {
  title: "정답이 보이지 않을 때, 먼저 기준부터 세우는 편이에요",
  discovery: "최근 프로젝트를 분석하는 과정에서 이전에는 서로 다른 경험으로 남아 있던 기록들이\n하나의 패턴으로 이어질 가능성을 발견했습니다",
  cards: [m(MARKETING[4]), r(RESUME[4]), b(BAND[4])],
  connected: {
    art: 7,
    tone: "blue",
    tags: ["밴드 동아리", "자기소개서", "마케팅 공..."],
    title: "정답이 보이지 않을 때,\n먼저 기준부터 세우는 편이에요",
    confidence: 82,
  },
  common: [
    "행동하기 전에 기준을 먼저 정의했어요",
    "여러 선택지를 같은 기준으로 비교했어요",
    "상황이 바뀌어도 기준을 유지하며 결정했어요",
  ],
  pattern: { highlight: "판단 기준을 먼저 세우는 방식", note: "이는 앞으로 비슷한 선택의 순간에서도 활용될 수 있는" },
  save: "앞으로 비슷한 경험이 생겼을 때",
};

export const STORIES: Record<string, Story> = {
  // 1 부족한 점 보완 (181:1246~1243)
  feedback: {
    title: "피드백에서 부족한 점을 찾아, 내용을 구체적으로 다듬었어요",
    discovery: discovery(["자기소개서", "영어 스터디", "마케팅 공모전"]),
    cards: [r(RESUME[7]), e(ENGLISH[2]), m(MARKETING[4])],
    connected: {
      art: 28,
      tone: "purple",
      tags: ["영어 스터디", "자기소개...", "마케팅..."],
      title: "피드백에서 부족한 점을 찾아,\n내용을 구체적으로 다듬었어요",
      confidence: 96,
    },
    common: [
      "받은 피드백에서 부족한 점을 정확히 짚었어요",
      "부족한 부분에 필요한 내용을 더했어요",
      "고친 내용을 다음 결과물에 반영했어요",
    ],
    pattern: {
      lead: "피드백에서",
      highlight: "부족한 점을 찾아 채우는 방식",
      note: "이는 앞으로 새로운 피드백을 받는 순간에도 활용될 수 있는",
    },
    save: "앞으로 비슷한 피드백을 받았을 때",
  },
  // 2 계획 조정 (181:1242~1239)
  plan: {
    title: "처음 계획이 맞지 않을 때, 조건을 다시 살펴 조정했어요",
    discovery: discovery(["마케팅 공모전", "밴드 동아리"]),
    cards: [m(MARKETING[2]), b(BAND[3])],
    connected: {
      art: 3,
      tone: "blue",
      tags: ["밴드 동아리", "마케팅 공모전"],
      title: "처음 계획이 맞지 않을 때,\n조건을 다시 살펴 조정했어요",
      confidence: 83,
    },
    common: ["계획이 맞지 않자, 가능한 조건을 다시 확인했어요", "확인한 조건에 맞게 계획을 새로 세웠어요"],
    pattern: {
      highlight: "조건을 다시 살펴 계획을 조정하는 방식",
      note: "이는 앞으로 예상과 다르게 흘러가는 순간에도 활용될 수 있는",
    },
    save: "앞으로 계획이 틀어지는 일이 생겼을 때",
  },
  // 3 나눠서 정리 (181:1238~1235)
  split: {
    title: "복잡한 내용을 작게 나누고, 순서를 정해 하나씩 정리했어요",
    discovery: discovery(["마케팅 공모전", "자기소개서", "밴드 동아리"]),
    cards: [m(MARKETING[0]), r(RESUME[4]), b(BAND[2])],
    connected: {
      art: 7,
      tone: "blue",
      tags: ["밴드 동아리", "자기소개...", "마케팅..."],
      title: "복잡한 내용을 작게 나누고,\n순서를 정해 하나씩 정리했어요",
      confidence: 93,
    },
    common: ["복잡한 일을 한눈에 보이는 단위로 나눴어요", "나눈 단위마다 순서를 정했어요", "정한 순서대로 하나씩 정리했어요"],
    pattern: {
      lead: "복잡한 일을",
      highlight: "작게 나눠 순서대로 푸는 방식",
      note: "이는 앞으로 처음 해보는 큰 과제 앞에서도 활용될 수 있는",
    },
    save: "앞으로 복잡한 과제를 시작할 때",
  },
  // 4 기록 되짚기 (181:1234~1231)
  review: {
    title: "기록을 되짚어 보며, 보완할 부분을 찾았어요",
    discovery: discovery(["자기소개서", "영어 스터디", "밴드 동아리"]),
    cards: [r(RESUME[5]), e(ENGLISH[5]), b(BAND[5])],
    connected: {
      art: 31,
      tone: "orange",
      tags: ["자기소개서", "영어 스터디", "밴드 동..."],
      title: "기록을 되짚어 보며,\n보완할 부분을 찾았어요",
      confidence: 95,
    },
    common: [
      "지난 과정을 기록이나 녹음으로 다시 확인했어요",
      "확인한 내용에서 보완할 부분을 찾았어요",
      "찾은 부분을 다음 준비에 활용했어요",
    ],
    pattern: {
      highlight: "기록을 되짚어 보완하는 방식",
      note: "이는 앞으로 지난 결과를 돌아보는 순간에도 활용될 수 있는",
    },
    save: "앞으로 돌아볼 기록이 쌓였을 때",
  },
  // 5 상대 입장 (181:1230~1227)
  audience: {
    title: "전달할 내용을 고를 때, 상대가 찾는 정보부터 살폈어요",
    discovery: discovery(["마케팅 공모전", "자기소개서"]),
    cards: [m(MARKETING[3]), r(RESUME[0])],
    connected: {
      art: 1,
      tone: "orange",
      tags: ["자기소개서", "마케팅 공모전"],
      title: "전달할 내용을 고를 때,\n상대가 찾는 정보부터 살폈어요",
      confidence: 85,
    },
    common: ["내 생각보다 상대가 찾는 정보를 먼저 살폈어요", "확인한 요구를 중심으로 전할 내용을 정했어요"],
    pattern: {
      highlight: "상대가 찾는 정보부터 살피는 방식",
      note: "이는 앞으로 누군가를 설득해야 하는 순간에도 활용될 수 있는",
    },
    save: "앞으로 전할 내용을 정해야 할 때",
  },
};

// 연결된 경험 카드 제목으로 이야기 찾기 (줄바꿈·쉼표·띄어쓰기 차이는 무시)
const key = (title: string) => title.replace(/[\s,]/g, "");
const BY_TITLE = new Map(Object.entries(STORIES).map(([slug, s]) => [key(s.connected.title), slug]));
export const storySlugFor = (title: string) => BY_TITLE.get(key(title));
