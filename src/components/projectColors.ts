export type ProjectColor = "pink" | "orange" | "blue";

// Figma 방사형 그라데이션 핸들(중심 49.7%·31%, 가로 70.8%·세로 86.3% 반지름)을 CSS로 옮긴 것
export const radial = (from: string, to: string) =>
  `radial-gradient(70.8% 86.3% at 49.7% 31%, ${from}, ${to})`;

// 프로젝트 색: 그라데이션 시작·끝, 폴더 제목, 피드백 태그 배경·글자, 상세 패널 프로젝트 칩 배경(분홍·주황은 Figma 미정)
export const PROJECT_COLORS: Record<
  ProjectColor,
  { from: string; to: string; title: string; tagBg: string; tagText: string; chipBg: string }
> = {
  pink: { from: "#ff7ac8", to: "#ffe2f3", title: "#a80c55", tagBg: "#fef1f9", tagText: "#fa3aa5", chipBg: "#fde3f3" },
  orange: { from: "#ffae6b", to: "#ffe9d7", title: "#9c2b10", tagBg: "#fff6ed", tagText: "#fc6513", chipBg: "#ffeedd" },
  blue: { from: "#44bcf8", to: "#dbf3ff", title: "#02578a", tagBg: "#f0f9ff", tagText: "#0e9fe9", chipBg: "#e0f1fe" },
};

// 달력 점 배경
export const DOT = Object.fromEntries(
  Object.entries(PROJECT_COLORS).map(([k, c]) => [k, radial(c.from, c.to)]),
) as Record<ProjectColor, string>;
