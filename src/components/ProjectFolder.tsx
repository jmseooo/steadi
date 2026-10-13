import Image from "next/image";

export type FolderColor = "pink" | "orange" | "blue";

// Figma: 폴더 뒷면 방사형 그라데이션(시작·끝 색)과 제목 색
const PALETTE: Record<FolderColor, { from: string; to: string; title: string }> = {
  pink: { from: "#ff7ac8", to: "#ffe2f3", title: "#a80c55" },
  orange: { from: "#ffae6b", to: "#ffe9d7", title: "#9c2b10" },
  blue: { from: "#44bcf8", to: "#dbf3ff", title: "#02578a" },
};

// 폴더 안 종이 3장 (뒤 → 앞). 위치는 180×146 폴더 기준 px
const PAPERS = [
  { left: 27.53, top: 12.7, width: 124.94, height: 90, bg: "var(--color-line)" },
  { left: 21.18, top: 18, width: 137.65, height: 90, bg: "var(--color-toggle)" },
  { left: 13.76, top: 24.35, width: 152.47, height: 108, bg: "var(--color-canvas)" },
];

export type Project = {
  title: string;
  color: FolderColor;
  experiences: number;
  hours: number;
  startedAt: string;
};

export default function ProjectFolder({ project }: { project: Project }) {
  const c = PALETTE[project.color];

  return (
    <button type="button" className="flex w-[180px] flex-col gap-[12px] text-left">
      <div className="relative h-[146.12px] w-[180px]">
        <div
          className="absolute inset-0 rounded-[27.53px] opacity-90"
          style={{ background: `radial-gradient(127.4px 126px at 49.7% 31%, ${c.from}, ${c.to})` }}
        />
        {PAPERS.map((p) => (
          <div
            key={p.width}
            className="absolute rounded-[14.82px] shadow-[inset_0_0_15.88px_#fff,0_2.12px_31.76px_rgba(0,0,0,0.05)]"
            style={{ left: p.left, top: p.top, width: p.width, height: p.height, background: p.bg }}
          />
        ))}
        {/* 앞면 에셋은 블러 번짐 여백(1배 기준 사방 10.67px)을 포함한 이미지 */}
        <Image
          src={`/assets/folder-front-${project.color}.png`}
          alt=""
          width={201}
          height={134}
          className="pointer-events-none absolute top-[23.17px] -left-[10.67px] h-[133.67px] w-[201.33px] max-w-none"
        />
        <span
          className="absolute top-[103.77px] left-[23.29px] text-[17px] leading-[23.8px] font-semibold"
          style={{ color: c.title }}
        >
          {project.title}
        </span>
      </div>

      <div className="flex flex-col gap-[2px] px-[10px] font-semibold">
        <span className="text-[15px] leading-[21px] text-ink-sub">
          저장 경험 {project.experiences} · {project.hours}시간
        </span>
        <span className="text-[13px] leading-[18.2px] text-disabled">{project.startedAt} ~</span>
      </div>
    </button>
  );
}
