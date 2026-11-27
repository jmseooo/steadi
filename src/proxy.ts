import { NextResponse, type NextRequest } from "next/server";
import { isLoginRequired, isSupabaseConfigured } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/proxy";

// 로그인 없이 열리는 곳: 회원가입·온보딩, 로그인 콜백, 주소로 바로 보는 이야기, UT 관리자, 개발용 시험 로그인(로컬만)
const PUBLIC = ["/onboarding", "/auth", "/growth/connected", "/admin", "/api/dev", "/dev"];

// 모든 페이지 요청 전에: 세션을 새로 고치고, (켜져 있으면) 로그인 안 한 사용자를 회원가입으로 보낸다
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  const { response, userId } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (isLoginRequired && !userId && !PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c)); // 새로 고친 세션 쿠키도 같이
    return redirect;
  }
  return response;
}

export const config = {
  // 그림·글꼴·Next 내부 파일은 건너뛴다
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|woff2?)$).*)"],
};
