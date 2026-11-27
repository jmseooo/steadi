import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { NOTION_CALLBACK_PATH, notionAuthorizeUrl } from "@/lib/notion";
import { getCurrentUser } from "@/lib/supabase/server";

// 노션 연결 시작: 연결 버튼은 이 주소로 보내면 된다 (/api/notion/connect?next=/돌아갈곳)
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  if (!(await getCurrentUser())) return NextResponse.redirect(new URL("/onboarding?error=login", origin));

  // state: 다른 사이트가 남의 노션을 우리 계정에 붙이는 것을 막는 값. 쿠키와 비교한다
  const state = randomBytes(16).toString("hex");
  const raw = searchParams.get("next") ?? "/";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  const res = NextResponse.redirect(notionAuthorizeUrl(origin + NOTION_CALLBACK_PATH, state));
  const cookie = { httpOnly: true, secure: origin.startsWith("https"), sameSite: "lax" as const, path: "/api/notion", maxAge: 600 };
  res.cookies.set("notion_state", state, cookie);
  res.cookies.set("notion_next", next, cookie);
  return res;
}
