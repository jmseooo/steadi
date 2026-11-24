import { notFound } from "next/navigation";
import ConnectedStory from "@/components/growth/ConnectedStory";
import { getStory, getStorySlugs, getSuggestions } from "@/lib/data";

// 연결된 경험 이야기 5개 (Figma 181:1226). 프로젝트 세부의 연결된 경험 카드에서 들어온다
export const dynamicParams = false;
export const generateStaticParams = async () => (await getStorySlugs()).map((slug) => ({ slug }));

export default async function StoryPage({ params, searchParams }: PageProps<"/growth/connected/[slug]">) {
  const { slug } = await params;
  const [story, suggestions] = await Promise.all([getStory(slug), getSuggestions()]);
  if (!story) notFound();
  // 개발 모드에서만 ?scene= 으로 원하는 장면부터 (화면 확인용)
  const q = process.env.NODE_ENV === "production" ? {} : await searchParams;
  return <ConnectedStory key={slug} story={story} suggestions={suggestions} startScene={Number(q.scene) || 1} />;
}
