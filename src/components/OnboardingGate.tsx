"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

// 온보딩을 마쳤는지 표시하는 키. sessionStorage에 두되 페이지를 새로 열 때마다 지운다(아래 checkFreshEntry),
// 나중에 최초 1회로 바꿀 땐 localStorage로 바꾸고 checkFreshEntry를 빼면 된다.
const KEY = "steadi:onboarded";
// 앱이 일부러 페이지를 새로 불러올 때(로고 클릭, 부스 PC 자동 초기화) 한 번만 온보딩을 건너뛰게 하는 표시
const PASS_KEY = "steadi:onboarding-pass";
const storage = () => window.sessionStorage;

export function markOnboarded() {
  try {
    storage().setItem(KEY, "1");
  } catch {}
}

// 온보딩 도중이었어도 다시 불러온 뒤엔 홈이 열리게 완료로 표시한다
export function keepOnboarded() {
  try {
    storage().setItem(KEY, "1");
    storage().setItem(PASS_KEY, "1");
  } catch {}
}

// 주소를 새로 입력해 들어오면(같은 탭이어도) 회원가입 → 온보딩부터 다시 시작한다.
// Chrome은 같은 주소를 다시 입력하면 새로고침으로 처리해서, 새로고침도 처음부터로 본다.
// 앱이 일부러 다시 불러온 경우(keepOnboarded)만 이어서 본다. 페이지를 새로 불러올 때 한 번만 판단
let entryChecked = false;
function checkFreshEntry() {
  if (entryChecked) return;
  entryChecked = true;
  try {
    if (storage().getItem(PASS_KEY) !== "1") storage().removeItem(KEY);
    storage().removeItem(PASS_KEY);
  } catch {}
}

function isOnboarded() {
  checkFreshEntry();
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
  // 온보딩 자신과, 주소로 바로 보는 화면(성장 > 연결된 경험 자세히 보기, UT 관리자)은 온보딩 없이 연다
  const exempt =
    pathname.startsWith("/onboarding") || pathname.startsWith("/growth/connected") || pathname.startsWith("/admin");
  // 서버 렌더에선 알 수 없음(null) → 브라우저에서 저장소를 읽은 뒤 판단
  const onboarded = useSyncExternalStore(noop, isOnboarded, () => null);

  useEffect(() => {
    if (!exempt && onboarded === false) router.replace("/onboarding");
  }, [exempt, onboarded, router]);

  // 확인 전에는 화면을 그리지 않아 홈이 잠깐 보였다 사라지는 걸 막는다
  return exempt || onboarded ? children : null;
}
