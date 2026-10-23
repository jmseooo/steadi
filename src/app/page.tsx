import Gnb from "@/components/Gnb";
import HomeScreen from "@/components/home/HomeScreen";

export default function Home() {
  return (
    <>
      <Gnb active="Home" />
      <HomeScreen />
    </>
  );
}
