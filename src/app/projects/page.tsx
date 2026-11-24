import Gnb from "@/components/Gnb";
import ProjectHome from "@/components/ProjectHome";
import { getProjects } from "@/lib/data";

export default async function Projects() {
  const projects = await getProjects();
  return (
    <>
      <Gnb active="Project" />
      <ProjectHome projects={projects} />
    </>
  );
}
