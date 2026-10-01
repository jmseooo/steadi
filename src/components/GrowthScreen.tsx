"use client";

import { useState } from "react";
import CardCollection from "./CardCollection";
import CardWheel from "./CardWheel";
import FocusCard from "./FocusCard";
import GrowthControls, { type Filter, type View } from "./GrowthControls";
import WheelStage from "./WheelStage";

// 필터 칩과 보기 전환을 묶는다: '경험 카드'는 격자 목록, 나머지는 원형 휠.
export default function GrowthScreen() {
  const [filter, setFilter] = useState<Filter>("연결된 경험");
  const view: View = filter === "경험 카드" ? "grid" : "wheel";
  const changeView = (next: View) => setFilter(next === "grid" ? "경험 카드" : "연결된 경험");

  return (
    <>
      <GrowthControls filter={filter} onFilterChange={setFilter} view={view} onViewChange={changeView} />
      {view === "grid" ? (
        <CardCollection />
      ) : (
        <WheelStage>
          <CardWheel>
            <FocusCard />
          </CardWheel>
        </WheelStage>
      )}
    </>
  );
}
