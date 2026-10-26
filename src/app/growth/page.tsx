import GrowthHome from "@/components/growth/GrowthHome";

// Suspense로 감싸지 않는다: 감싸면 Growth로 넘어오는 동안 빈 화면이 깜박인다 (탭은 GrowthHome이 주소에서 직접 읽음)
export default function GrowthPage() {
  return <GrowthHome />;
}
