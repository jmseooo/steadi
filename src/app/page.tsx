import Gnb from "@/components/Gnb";
import HomeScreen from "@/components/home/HomeScreen";
import { getHomeData } from "@/lib/data";

export default async function Home() {
  const data = await getHomeData();
  return (
    <>
      <Gnb active="Home" />
      <HomeScreen data={data} />
    </>
  );
}
