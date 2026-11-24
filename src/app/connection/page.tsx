import ConnectionHome from "@/components/ConnectionHome";
import Gnb from "@/components/Gnb";
import { getConnectionData } from "@/lib/data";

export default async function Connection() {
  const data = await getConnectionData();
  return (
    <>
      <Gnb active="Connection" />
      <ConnectionHome data={data} />
    </>
  );
}
