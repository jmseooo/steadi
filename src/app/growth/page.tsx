import { Suspense } from "react";
import GrowthHome from "@/components/growth/GrowthHome";

// 성장 홈은 ?tab= 을 읽으므로 Suspense 안에서 그린다
export default function GrowthPage() {
  return (
    <Suspense>
      <GrowthHome />
    </Suspense>
  );
}
