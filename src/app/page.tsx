import Gnb from "@/components/Gnb";
import GrowthScreen from "@/components/GrowthScreen";
import SideNav from "@/components/SideNav";

// Figma "레이아웃 19"(원형 휠) · "레이아웃 17"(경험 카드 목록) — 1440 기준 반응형
// GNB·내비는 화면에 고정, 본문은 GNB(70) 아래 92부터. 1024 미만은 하단 내비 높이만큼 비운다.
export default function Home() {
  return (
    <>
      <Gnb />
      <SideNav />
      <main className="flex min-h-dvh flex-col pt-[92px] max-lg:pb-[82px]">
        <GrowthScreen />
      </main>
    </>
  );
}
