import ConnectedStory from "@/components/growth/ConnectedStory";
import { DEFAULT_STORY } from "@/components/growth/stories";

export default async function ConnectedStoryPage({ searchParams }: PageProps<"/growth/connected">) {
  // 개발 모드에서만 ?scene= 으로 원하는 장면부터 (화면 확인용)
  const q = process.env.NODE_ENV === "production" ? {} : await searchParams;
  const scene = Number(q.scene) || 1;
  return <ConnectedStory story={DEFAULT_STORY} startScene={scene} />;
}
