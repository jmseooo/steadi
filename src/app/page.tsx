import Gnb from "@/components/Gnb";
import GrowthScreen from "@/components/GrowthScreen";
import SideNav from "@/components/SideNav";
import Stage from "@/components/Stage";

// Figma "레이아웃 19"(원형 휠) · "레이아웃 17"(경험 카드 목록) (1440×810)
export default function Home() {
  return (
    <Stage header={<Gnb />} side={<SideNav />}>
      <GrowthScreen />
    </Stage>
  );
}
