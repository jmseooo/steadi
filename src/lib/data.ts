import type { ConnectionData } from "@/components/connectionData";
import { DETAIL, DOTS, FEEDBACKS, PROJECTS as CONNECTION_PROJECTS } from "@/components/connectionData";
import { GROWTH_CARDS, type GrowthCard } from "@/components/growth/growthCards";
import { MOMENTS, momentCards, type Moment } from "@/components/growth/moments";
import { DEFAULT_STORY, STORIES, storySlugFor, SUGGESTIONS, type Story, type Suggestion } from "@/components/growth/stories";
import { BRIEFINGS, CHANGES, HISTORY, PROJECT_NAME, type BriefingItem, type Change, type HistoryItem } from "@/components/home/data";
import type { ConnectedCardData } from "@/components/project-detail/Cards";
import { PROJECT_DETAILS, PROJECT_LIST, type ProjectDetailData, type ProjectListItem } from "@/components/project-detail/data";
import type { ProjectColor } from "@/components/projectColors";

/*
 * 화면이 데이터를 받는 유일한 입구. 각 화면의 page.tsx가 여기 함수를 불러 화면 컴포넌트에 넘긴다.
 * 지금은 components/ 아래 가짜 데이터를 그대로 돌려준다. MVP에서는 함수 속만 Supabase 조회로 바꾸고
 * (lib/model.ts 형식 → 화면 타입으로 변환) 화면 코드는 건드리지 않는다.
 * 아직 여기로 안 옮긴 것: GNB의 알림·프로필, 온보딩, 경험 카드 자세히 보기 본문, 성장 그림 미리 받기(GrowthPreload)
 */

// 이야기가 있는 연결된 경험 카드에 자세히 보기 주소를 붙인다
const withStoryHref = <T extends ConnectedCardData>(card: T): T => {
  const slug = storySlugFor(card.title);
  return slug ? { ...card, href: `/growth/connected/${slug}` } : card;
};

// ─── 홈 ───

export type HomeData = {
  briefings: BriefingItem[];
  changes: Change[];
  history: HistoryItem[];
  projectNames: Record<ProjectColor, string>;
};

export async function getHomeData(): Promise<HomeData> {
  return { briefings: BRIEFINGS, changes: CHANGES, history: HISTORY, projectNames: PROJECT_NAME };
}

// ─── 프로젝트 ───

export async function getProjects(): Promise<ProjectListItem[]> {
  return PROJECT_LIST;
}

export async function getProjectDetail(id: string): Promise<ProjectDetailData | undefined> {
  const project = PROJECT_DETAILS[id];
  if (!project) return undefined;
  return { ...project, connected: project.connected.map(withStoryHref) };
}

// ─── 성장 ───

export async function getGrowthCards(): Promise<GrowthCard[]> {
  return GROWTH_CARDS.map(withStoryHref);
}

export async function getMoments(): Promise<Moment[]> {
  return MOMENTS;
}

export async function getMoment(slug: string): Promise<{ moment: Moment; cards: ConnectedCardData[] } | undefined> {
  const moment = MOMENTS.find((m) => m.slug === slug);
  return moment && { moment, cards: momentCards(moment) };
}

/** 연결된 경험 이야기 */
export async function getStory(slug: string): Promise<Story | undefined> {
  return STORIES[slug];
}

/** 이야기가 없는 카드가 여는 기본 이야기 (/growth/connected) */
export async function getDefaultStory(): Promise<Story> {
  return DEFAULT_STORY;
}

export async function getStorySlugs(): Promise<string[]> {
  return Object.keys(STORIES);
}

/** 이야기 끝에 보여 줄 제안 카드 */
export async function getSuggestions(): Promise<Suggestion[]> {
  return SUGGESTIONS;
}

// ─── 커넥션 ───

export async function getConnectionData(): Promise<ConnectionData> {
  return { projects: CONNECTION_PROJECTS, feedbacks: FEEDBACKS, dots: DOTS, detail: DETAIL };
}
