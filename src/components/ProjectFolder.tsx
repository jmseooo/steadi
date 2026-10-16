import FolderArt, { FolderTitle } from "./FolderArt";
import type { ProjectColor } from "./projectColors";

export type Project = {
  title: string;
  color: ProjectColor;
  experiences: number;
  hours: number;
  startedAt: string;
};

export default function ProjectFolder({ project }: { project: Project }) {
  return (
    <button type="button" className="flex w-[180px] flex-col gap-[12px] text-left">
      <FolderArt color={project.color}>
        <FolderTitle color={project.color}>{project.title}</FolderTitle>
      </FolderArt>

      <div className="flex flex-col gap-[2px] px-[10px] font-semibold">
        <span className="text-[15px] leading-[21px] text-ink-sub">
          저장 경험 {project.experiences} · {project.hours}시간
        </span>
        <span className="text-[13px] leading-[18.2px] text-disabled">{project.startedAt} ~</span>
      </div>
    </button>
  );
}
