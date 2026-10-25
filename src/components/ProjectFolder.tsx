import Link from "next/link";
import FolderArt, { FolderTitle } from "./FolderArt";
import type { ProjectTone } from "./projectColors";

export type Project = {
  title: string;
  color: ProjectTone;
  experiences: number;
  hours: number;
  startedAt: string;
  href?: string; // 상세 화면이 있는 프로젝트만
};

export default function ProjectFolder({ project }: { project: Project }) {
  const body = (
    <>
      <FolderArt color={project.color}>
        <FolderTitle color={project.color}>{project.title}</FolderTitle>
      </FolderArt>

      <div className="flex flex-col gap-[2px] px-[10px] font-semibold">
        <span className="text-[15px] leading-[21px] text-ink-sub">
          저장 경험 {project.experiences} · {project.hours}시간
        </span>
        <span className="text-[13px] leading-[18.2px] text-disabled">{project.startedAt} ~</span>
      </div>
    </>
  );
  const cls = "flex w-[180px] flex-col gap-[12px] text-left";

  // 링크는 버튼 기본 호버(globals.css)가 안 걸려 같은 확대를 따로 준다
  return project.href ? (
    <Link href={project.href} className={`${cls} transition-[scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-108`}>
      {body}
    </Link>
  ) : (
    <button type="button" className={cls}>
      {body}
    </button>
  );
}
