"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginProvider = "kakao" | "google";

/** 돌아갈 곳은 우리 사이트 안 주소만 허용 (다른 사이트로 튕기는 공격 막기) */
function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/**
 * 카카오·구글 로그인 시작 (서버 액션). 로그인 화면 버튼에서 부른다 — 버튼 연결은 제나.
 *   <form action={signInWith.bind(null, "kakao", "/onboarding/hello")}><button>카카오로 회원가입</button></form>
 * 공급자 화면 → Supabase → /auth/callback → next 주소 순서로 돌아온다.
 */
export async function signInWith(provider: LoginProvider, next?: string) {
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}` },
  });
  if (error || !data.url) redirect("/onboarding?error=login");
  redirect(data.url);
}

/** 로그아웃 → 회원가입 화면으로 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/onboarding");
}
