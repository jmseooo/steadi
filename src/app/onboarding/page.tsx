import Onboarding, { type OnboardingDebug } from "@/components/onboarding/Onboarding";

export const metadata = { title: "Steadi 시작하기" };

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  // 개발 모드에서만 ?step= 등으로 원하는 화면을 바로 연다
  const debug = process.env.NODE_ENV === "production" ? {} : ((await searchParams) as OnboardingDebug);
  return <Onboarding debug={debug} />;
}
