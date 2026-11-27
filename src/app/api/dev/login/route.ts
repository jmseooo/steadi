import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/*
 * 개발용 시험 로그인 — 내 컴퓨터(npm run dev)에서만 동작한다. 미리보기·운영 배포에서는 404.
 * 카카오·구글 로그인이 되기 전에 "로그인한 상태"로 노션 연결·기록 저장·RLS를 시험하려고 둔다.
 * Supabase 익명 로그인(Authentication → Sign In / Providers → Allow anonymous sign-ins)이 켜져 있어야 한다.
 *
 *   http://localhost:3120/api/dev/login?next=/        → 익명 사용자로 로그인 후 next로
 *   http://localhost:3120/api/dev/login?logout=1      → 로그아웃
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") return new NextResponse(null, { status: 404 });

  const { origin, searchParams } = request.nextUrl;
  const supabase = await createClient();

  if (searchParams.get("logout")) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  const { data: current } = await supabase.auth.getClaims();
  if (!current?.claims?.sub) {
    const { error } = await supabase.auth.signInAnonymously({ options: { data: { name: "시험 사용자" } } });
    if (error) {
      return NextResponse.json(
        { error: error.message, hint: "Supabase에서 Allow anonymous sign-ins가 켜져 있는지 확인 (Owner만 바꿀 수 있음)" },
        { status: 400 },
      );
    }
  }

  const raw = searchParams.get("next") ?? "/";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  return NextResponse.redirect(new URL(next, origin));
}
