import ConnectionHome from "@/components/ConnectionHome";
import Gnb from "@/components/Gnb";

export default function Connection() {
  return (
    <>
      <Gnb active="Connection" />
      <ConnectionHome />
    </>
  );
}
