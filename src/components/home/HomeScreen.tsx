import Briefing from "./Briefing";
import Changes from "./Changes";
import History from "./History";

// 홈 (Figma "홈 | 브리핑 받기 전" 100:2968): 오늘의 브리핑 아래 주요 변경 사항(730) · 스테디 히스토리(450)
export default function HomeScreen() {
  return (
    <main className="px-5 pt-[20px] pb-[83px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[34px]">
        <Briefing />
        <div className="flex flex-col gap-[34px] lg:flex-row lg:gap-[20px]">
          <Changes />
          <History />
        </div>
      </div>
    </main>
  );
}
