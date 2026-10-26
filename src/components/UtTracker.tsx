"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { booth, endSession, flush, hasSession, startSession, track } from "@/lib/ut";
import { keepOnboarded } from "./OnboardingGate";

// 부스 PC: 이 시간 동안 조작이 없으면 다음 관람객을 위해 홈 처음으로 돌아간다.
// 돌아가기 10초 전부터 검정 토스트로 알리고, '이어보기'를 누르면 계속 볼 수 있다
const IDLE_MS = 3 * 60 * 1000;
const WARN_MS = 10 * 1000;

// 모든 화면에서 공통으로 남기는 흔적: 화면 보기(머문 시간 포함), 버튼·링크 클릭, 입력칸 값
export default function UtTracker() {
  const pathname = usePathname();

  // 화면에 들어올 때 page_view, 떠날 때 머문 시간과 함께 page_leave.
  // 온보딩 첫 화면(회원가입)으로 들어오면 새 관람객(체험)으로 본다.
  // 부스 PC는 앞사람을 끝내 두고, 다음 첫 행동부터 새 관람객으로 기록한다
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (pathname === "/onboarding" && !new URLSearchParams(location.search).has("step")) {
      if (!booth()) startSession();
      else if (hasSession()) endSession("onboarding");
    }
    const enter = performance.now();
    track("page_view");
    return () => track("page_leave", { value: { path: pathname, ms: Math.round(performance.now() - enter) } });
  }, [pathname]);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>("button, a, [role=button], [role=tab], label");
      if (!el) return;
      track("click", { target: labelOf(el), value: { x: e.clientX, y: e.clientY } });
    };
    // 입력칸은 다 쓰고 나갈 때(change) 값 한 번
    const onChange = (e: Event) => {
      const el = e.target as HTMLInputElement;
      if (!el.matches?.("input, textarea, select")) return;
      const value = el.type === "checkbox" || el.type === "radio" ? el.checked : el.value;
      track("input", { target: el.name || el.placeholder || el.getAttribute("aria-label") || el.type, value });
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("change", onChange, true);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("change", onChange, true);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return <IdleReset />;
}

// 부스 PC 자동 초기화: 마지막 조작 후 2분 50초가 지나면 토스트로 10초를 세고, 끝나면 지금 관람객을 끝내고 홈을 새로 연다
function IdleReset() {
  const [left, setLeft] = useState<number | null>(null); // 토스트에 보일 남은 초 (null = 토스트 없음)
  const warning = useRef(false);

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || !booth()) return;
    let idle: ReturnType<typeof setTimeout>;
    let tick: ReturnType<typeof setInterval>;
    const reset = () => {
      endSession("idle");
      keepOnboarded(); // 자동 초기화는 온보딩 없이 홈으로
      // 열린 창·카드 순서·스크롤까지 모두 처음으로 되돌리려고 새로 불러온다
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      location.assign("/");
    };
    const warn = () => {
      if (!hasSession() && location.pathname === "/") return arm(); // 아무도 안 썼으면 그대로
      warning.current = true;
      track("idle_warning");
      let n = WARN_MS / 1000;
      setLeft(n);
      tick = setInterval(() => {
        n -= 1;
        if (n > 0) return setLeft(n);
        clearInterval(tick);
        reset();
      }, 1000);
    };
    const arm = () => {
      clearTimeout(idle);
      clearInterval(tick);
      if (warning.current) {
        warning.current = false;
        setLeft(null);
      }
      idle = setTimeout(warn, IDLE_MS - WARN_MS);
    };
    const onActivity = (e: Event) => {
      if (warning.current) {
        // 토스트가 떠 있을 땐 마우스 움직임·스크롤로는 닫지 않는다 (이어보기 버튼까지 갈 수 있게) — 누르거나 키를 쳐야 이어 봄
        if (e.type !== "pointerdown" && e.type !== "keydown" && e.type !== "touchstart") return;
        track("idle_continue", { target: (e.target as Element).closest?.("[data-idle-continue]") ? "이어보기" : "화면 조작" });
      }
      arm();
    };
    const events = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"] as const;
    for (const e of events) window.addEventListener(e, onActivity, { capture: true, passive: true });
    arm();
    return () => {
      clearTimeout(idle);
      clearInterval(tick);
      for (const e of events) window.removeEventListener(e, onActivity, { capture: true });
    };
  }, []);

  if (left === null) return null;
  return (
    <div
      role="status"
      className="fixed bottom-[32px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-[16px] rounded-full bg-ink py-[10px] pr-[10px] pl-[24px] text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-[opacity,translate] duration-200 ease-out starting:translate-y-[8px] starting:opacity-0"
    >
      <p className="text-[15px] leading-[21px] font-semibold whitespace-nowrap">
        곧 처음으로 돌아가요 <span className="ml-[4px] font-medium text-white/50 tabular-nums">{left}초</span>
      </p>
      <button
        type="button"
        data-idle-continue
        className="h-[36px] rounded-full bg-white/15 px-[16px] text-[14px] font-semibold whitespace-nowrap hover:bg-white/25"
      >
        이어보기
      </button>
    </div>
  );
}

// 버튼 이름: aria-label → 보이는 글자 → 이미지 alt → 링크 주소
function labelOf(el: HTMLElement) {
  const text = el.getAttribute("aria-label") || el.innerText?.replace(/\s+/g, " ").trim() || el.querySelector("img")?.alt || el.getAttribute("href") || el.tagName.toLowerCase();
  return text.slice(0, 80);
}
