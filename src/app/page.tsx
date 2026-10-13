import Gnb from "@/components/Gnb";
import ProjectHome from "@/components/ProjectHome";

export default function Home() {
  return (
    <>
      <Gnb active="Project" />
      <ProjectHome />
    </>
  );
}
