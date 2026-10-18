import { notFound } from "next/navigation";
import Gnb from "@/components/Gnb";
import ProjectDetail from "@/components/project-detail/ProjectDetail";
import { PROJECT_DETAILS } from "@/components/project-detail/data";

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const project = PROJECT_DETAILS[id];
  if (!project) notFound();

  return (
    <>
      <Gnb active="Project" />
      <ProjectDetail project={project} />
    </>
  );
}
