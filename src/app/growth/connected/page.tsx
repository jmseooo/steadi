import ConnectedStory from "@/components/growth/ConnectedStory";

export default async function ConnectedStoryPage({ searchParams }: PageProps<"/growth/connected">) {
  // 개발 모드에서만 ?scene= 으로 원하는 장면부터 (화면 확인용)
  const q = process.env.NODE_ENV === "production" ? {} : await searchParams;
  const scene = Number(q.scene) || 1;
  return (
    <ConnectedStory
      title="정답이 보이지 않을 때, 먼저 기준부터 세우는 편이에요"
      cardTitle={"정답이 보이지 않을 때,\n먼저 기준부터 세우는 편이에요"}
      startScene={scene}
    />
  );
}
