"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

// 온보딩을 마쳤는지 표시하는 키. 지금은 임시로 sessionStorage(탭을 새로 열 때마다 다시 온보딩),
// 나중에 최초 1회로 바꿀 땐 localStorage로만 바꾸면 된다.
const KEY = "steadi:onboarded";
const storage = () => window.sessionStorage;

export function markOnboarded() {
  try {
    storage().setItem(KEY, "1");
  } catch {}
}

function isOnboarded() {
  try {
    return storage().getItem(KEY) === "1";
  } catch {
    return true; // 저장소를 못 쓰면 막지 않는다
  }
}

const noop = () => () => {};

// 온보딩을 안 거친 채 다른 화면에 들어오면 /onboarding으로 보낸다
export default function OnboardingGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const exempt = pathname.startsWith("/onboarding");
  // 서버 렌더에선 알 수 없음(null) → 브라우저에서 저장소를 읽은 뒤 판단
  const onboarded = useSyncExternalStore(noop, isOnboarded, () => null);

  useEffect(() => {
    if (!exempt && onboarded === false) router.replace("/onboarding");
  }, [exempt, onboarded, router]);

  // 확인 전에는 화면을 그리지 않아 홈이 잠깐 보였다 사라지는 걸 막는다
  return exempt || onboarded ? children : null;
}
